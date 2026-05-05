import re
from os import getenv

from langchain_core.messages import AIMessage
from langchain_core.prompts import PromptTemplate

# from langchain_tavily import TavilySearch
from langgraph.graph import END, START
from langgraph.graph.state import StateGraph
from tavily import TavilyClient

from src.ragify.classification.model import classification_model
from src.ragify.generation.llm import llm
from src.ragify.generation.prompts import prompts
from src.ragify.generation.schema import Evaluate, RouteIdentifier
from src.ragify.generation.state import State
from src.ragify.generation.tools import doc_tool, routing_tool
from src.ragify.retrieval import get_retriever
from src.utils.colors import colorize

tavily_client = TavilyClient(api_key=getenv("TAVILY_API_KEY"))

def query_classifier(state: State):
    workspace_id = state.get("workspace_id")
    question = state.get("messages", [{}])[-1].content
    print(colorize(f"\n\n\nQuestion: {question}", "RED"))

    retriever = get_retriever(workspace_id)
    context = retriever.invoke({"query": question})
    print(colorize(f"\ncontext: \n{context}", "CYAN"))


    classify_prompt = PromptTemplate(
        template=prompts.classify_prompt,
        input_variables=["question", "context"],
    )
    # classify = classification_model.classify(RouteIdentifier)
    classify = classification_model.client
    chain = classify_prompt | classify

    try:
        result = chain.invoke({"question": question, "context": context}).content

        match = re.search(r"\s*['\"]?(index|general|search)['\"]?", str(result))
        route = match.group(1) if match else 'index'

        print(colorize(f"\n\n\nResult: {result}", "GREEN"))
        print(colorize(f"\n\n\nQuery classifier: {route}", "GREEN"))

        return {
            "messages": state["messages"],
            "route": route,
            "latest_query": question,
            "context": [context],
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        print("Error")



def general_llm(state: State):
    result = llm.invoke(state["messages"])
    print("inside general llm")
    print(colorize(f"General LLM result: {result}", "GREEN"))
    return {"messages": [result]}


def retriever_node(state: State):
    messages = state.get("latest_query", "")
    workspace_id = state.get("workspace_id")
    from src.ragify.generation.agent import get_agent

    print(colorize(f"latest_query: {messages}", "CYAN"))

    agent = get_agent(workspace_id)
    result = agent.invoke({"input": messages})

    print(colorize(f"Retriever result: {result}", "CYAN"))

    output = result.get("messages", "")[-1]
    if isinstance(output, AIMessage):
        output = output.content

    intermediate_steps = result.get("messages", [])
    tool_calls = []
    if intermediate_steps:
        for action, tool_result in intermediate_steps:
            tool_calls.append({"tool": action.tool, "input": action.tool_input})

    new_message = AIMessage(
        content=output, additional_kwargs={"tool_calls": tool_calls}
    )
    print(colorize(f"retriever_node intermediate result: {new_message}", "CYAN"))
    print(colorize(f"retriever_node final result: {output}", "GREEN"))

    return {"messages": [new_message], "context": [output]}


def evaluator(state: State):
    context = state.get('context', [])

    grading_prompt = PromptTemplate(
        template=prompts.grading_prompt,
        input_variables=["question", "context"],
    )
    # messages = state.get("messages", [{}])
    # last_msg = messages[-1]
    # Handle both dict and AIMessage/Message objects
    # if hasattr(last_msg, 'content'):
    #     context = last_msg.content
    # elif isinstance(last_msg, dict):
    #     context = last_msg.get('content', '')
    # else:
    #     context = str(last_msg)

    question = state.get("latest_query", "")

    print(colorize(f"Context for evaluator: {context}", "RED"))

    llm_with_grade = llm.with_structured_output(Evaluate)
    chain_graded = grading_prompt | llm_with_grade
    result = chain_graded.invoke({"question": question, "context": str(context)})

    print(colorize(f"\n\nRetrival evaluator: {result}", "GREEN"))
    return {"messages": state["messages"], "binary_score": result.binary_score}


def query_refinement(state: State):
    query = state.get("latest_query", "")
    rewrite_prompt = PromptTemplate(
        template=prompts.rewrite_prompt, input_variables=["query"]
    )
    chain = rewrite_prompt | llm.client
    result = chain.invoke({"query": query})
    print(colorize(f"\n\nQuery refinement: {result}", "GREEN"))

    return {"latest_query": result.content}


def web_search(state: State):
    # try:
    # search_tool = TavilySearch(max_results=5, topic="general")
    # result = search_tool.invoke({"query": state.get("latest_query", "")})
    results = tavily_client.search(state.get("latest_query", "")).get('results', [])

    # contents = [item["content"] for item in result if "content" in item]
    print(colorize(f"\n\nWeb search: {results}", "GREEN"))

    websearch_result = "web search results:\n" + "\n\n".join([
        f"{result.get('title')} ({result.get('url')})\n{result.get('content')}"
        for result in results
    ])

    return {"messages": [AIMessage(content=websearch_result)]}
    # except Exception as e:
    #     import traceback
    #     traceback.print_exc()
    #     print(f"Error: {e}")

def generate(state: State):
    context = state.get('context', [])
    messages = state.get("messages", [{}])
    # Handle both dict and AIMessage/Message objects
    message_contents = []
    for msg in messages:
        if hasattr(msg, 'content'):
            message_contents.append(msg.content)
        elif isinstance(msg, dict):
            message_contents.append(msg.get('content', ''))
        else:
            message_contents.append(str(msg))
    message_contents.extend(context)

    context = "\n\n\n".join(message_contents)
    print(colorize(f"\n\nGeneration context: {context}", "CYAN"))
    generate_prompt = PromptTemplate(
        template=prompts.generate_prompt,
        input_variables=["context"]
    )
    generate_chain = generate_prompt | llm.client
    result = generate_chain.invoke({"context": context})

    print(colorize(f"Generation: {result.content}", "GREEN"))

    return {"messages": [result]}



graph = StateGraph(State)

graph.add_node("query_analysis", query_classifier)
graph.add_node("retriever", retriever_node)
graph.add_node("evaluator", evaluator)
graph.add_node("generator", generate)
graph.add_node("refinement", query_refinement)
graph.add_node("web_search", web_search)
graph.add_node("general_llm", general_llm)

graph.add_edge(START, "query_analysis")
graph.add_conditional_edges("query_analysis", routing_tool)
graph.add_edge("general_llm", END)

graph.add_edge("retriever", "evaluator")
graph.add_conditional_edges("evaluator", doc_tool)
graph.add_edge("refinement", "retriever")

graph.add_edge("web_search", "generator")
graph.add_edge("generator", END)


builder = graph.compile()
