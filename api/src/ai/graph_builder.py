from langchain_core.messages import AIMessage
from langchain_core.prompts import PromptTemplate
from langchain_tavily import TavilySearch
from langgraph.graph import END, START
from langgraph.graph.state import StateGraph

from src.ai.llm import llm
from src.ai.reAct_agent import get_agent
from src.ai.tools import doc_tool, routing_tool
from src.config.settings import Config
from src.types.evaluator import Evaluate
from src.types.route_identifier import RouteIdentifier
from src.types.state import State

from .retriever import get_retriever

config = Config()


def query_classifier(state: State):
    question = state.get("messages")[-1].content
    workspace_id = state.get("workspace_id")
    retriever_tool = get_retriever(workspace_id)
    context = retriever_tool.invoke(question)
    print("Docs received from Qdrant")

    llm_with_structured_output = llm.with_structured_output(RouteIdentifier)
    classify_prompt = PromptTemplate(
        template=config.prompt("classify_prompt"),
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
    """
    Fetch general common knowledge result from the LLM.

    Args:
        state (State): The current state of the graph.
    Returns:
        dict: Updated messages from LLM.
    """
    result = llm.invoke(state["messages"])
    print("inside general llm")
    print(result)
    return {"messages": result}


def retriever_node(state: State):
    """
    Retrieve results from vector stores using the reAct agent.

    Args:
        state (State): The current state of the graph.

    Returns:
        dict: Updated messages with tool calls.
    """
    messages = state["latest_query"]
    workspace_id = state.get("workspace_id")
    agent = get_agent(workspace_id)
    result = agent.invoke({"input": messages})

    # Extract tool calls
    intermediate_steps = result.get("intermediate_steps", [])
    tool_calls = []
    if intermediate_steps:
        for action, tool_result in intermediate_steps:
            tool_calls.append(
                {
                    "tool": action.tool,
                    "input": action.tool_input,
                }
            )

    new_message = AIMessage(
        content=result["output"],
        additional_kwargs={"tool_calls": tool_calls},
    )

    return {"messages": [new_message]}


def evaluator(state: State):
    """
    Evaluate the results retrieved from vector stores.

    Args:
        state (State): The current state of the graph.
    Returns:
        dict: Updated state with binary_score.
    """
    grading_prompt = PromptTemplate(
        template=config.prompt("grading_prompt"),
        input_variables=["question", "context"],
    )
    context = state["messages"][-1].content
    question = state["latest_query"]

    llm_with_grade = llm.with_structured_output(Evaluate)

    chain_graded = grading_prompt | llm_with_grade
    result = chain_graded.invoke({"question": question, "context": context})

    print(result)
    return {"messages": state["messages"], "binary_score": result.binary_score}


def query_refinement(state: State):
    """
    Refine the query to get better retrieval results.

    Args:
        state (State): State of the question.
    Returns:
        dict: Updated latest_query.
    """
    query = state["latest_query"]
    rewrite_prompt = PromptTemplate(
        template=config.prompt("rewrite_prompt"), input_variables=["query"]
    )
    chain = rewrite_prompt | llm
    result = chain.invoke({"query": query})
    print(result)

    return {"latest_query": result.content}


def generate(state: State):
    """
    Generate the final answer for the user.

    Args:
        state (State): State of the question.
    Returns:
        dict: Generated response.
    """
    context = state["messages"][-1].content

    generate_prompt = PromptTemplate(
        template=config.prompt("generate_prompt"), input_variables=["context"]
    )

    generate_chain = generate_prompt | llm
    result = generate_chain.invoke({"context": context})

    return {"messages": [{"role": "assistant", "content": result.content}]}


def web_search(state: State):
    """
    Search the web for the rewritten query.

    Args:
        state (State): The current state of the graph.
    Returns:
        dict: Search results as messages.
    """
    # Initialize the Tavily tool
    search_tool = TavilySearch()

    # Search a query
    result = search_tool.invoke(state["latest_query"])

    contents = [item["content"] for item in result if "content" in item]
    print(contents)

    return {"messages": [{"role": "assistant", "content": "\n\n".join(contents)}]}


graph = StateGraph(State)

# Nodes
graph.add_node("query_analysis", query_classifier)
graph.add_node("retriever", retriever_node)
graph.add_node("evaluator", evaluator)
graph.add_node("generator", generate)
graph.add_node("refinement", query_refinement)
graph.add_node("web_search", web_search)
graph.add_node("general_llm", general_llm)

# Edges
graph.add_edge(START, "query_analysis")
graph.add_conditional_edges("query_analysis", routing_tool)
graph.add_edge("general_llm", END)

graph.add_edge("retriever", "evaluator")
graph.add_conditional_edges("evaluator", doc_tool)
graph.add_edge("refinement", "retriever")

graph.add_edge("web_search", "generator")
graph.add_edge("generator", END)


builder = graph.compile()
