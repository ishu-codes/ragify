from langchain_core.messages import AIMessage
from langchain_core.prompts import PromptTemplate
from langchain_tavily import TavilySearch
from langgraph.graph import END, START
from langgraph.graph.state import StateGraph

from src.ragify.generation.llm import llm
from src.ragify.generation.prompts import prompts
from src.ragify.generation.schema import Evaluate, RouteIdentifier
from src.ragify.generation.state import State
from src.ragify.generation.tools import doc_tool, routing_tool
from src.ragify.retrieval import get_retriever


def query_classifier(state: State):
    question = state.get("messages", [{}])[-1].content
    workspace_id = state.get("workspace_id")
    retriever_tool = get_retriever(workspace_id)
    context = retriever_tool.invoke(question)
    print("Docs received from Qdrant")

    llm_with_structured_output = llm.with_structured_output(RouteIdentifier)
    classify_prompt = PromptTemplate(
        template=prompts.classify_prompt,
        input_variables=["question", "context"],
    )
    chain = classify_prompt | llm_with_structured_output

    result = chain.invoke({"question": question, "context": context})
    print("Result received is in query classifier")
    print(result.route)

    return {
        "messages": state["messages"],
        "route": result.route,
        "latest_query": question,
    }


def general_llm(state: State):
    result = llm.invoke(state["messages"])
    print("inside general llm")
    print(result)
    return {"messages": result}


def retriever_node(state: State):
    messages = state.get("latest_query", "")
    workspace_id = state.get("workspace_id")
    from src.ragify.generation.agent import get_agent

    agent = get_agent(workspace_id)
    result = agent.invoke({"input": messages})

    intermediate_steps = result.get("intermediate_steps", [])
    tool_calls = []
    if intermediate_steps:
        for action, tool_result in intermediate_steps:
            tool_calls.append({"tool": action.tool, "input": action.tool_input})

    new_message = AIMessage(
        content=result.get("output", ""), additional_kwargs={"tool_calls": tool_calls}
    )

    return {"messages": [new_message]}


def evaluator(state: State):
    grading_prompt = PromptTemplate(
        template=prompts.grading_prompt,
        input_variables=["question", "context"],
    )
    context = state.get("messages", [{}])[-1].content
    question = state.get("latest_query", "")

    llm_with_grade = llm.with_structured_output(Evaluate)
    chain_graded = grading_prompt | llm_with_grade
    result = chain_graded.invoke({"question": question, "context": context})

    print(result)
    return {"messages": state["messages"], "binary_score": result.binary_score}


def query_refinement(state: State):
    query = state.get("latest_query", "")
    rewrite_prompt = PromptTemplate(
        template=prompts.rewrite_prompt, input_variables=["query"]
    )
    chain = rewrite_prompt | llm
    result = chain.invoke({"query": query})
    print(result)

    return {"latest_query": result.content}


def generate(state: State):
    context = state.get("messages", [{}])[-1].content
    generate_prompt = PromptTemplate(
        template=prompts.generate_prompt, input_variables=["context"]
    )
    generate_chain = generate_prompt | llm
    result = generate_chain.invoke({"context": context})

    return {"messages": [{"role": "assistant", "content": result.content}]}


def web_search(state: State):
    search_tool = TavilySearch()
    result = search_tool.invoke(state.get("latest_query", ""))

    contents = [item["content"] for item in result if "content" in item]
    print(contents)

    return {"messages": [{"role": "assistant", "content": "\n\n".join(contents)}]}


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
