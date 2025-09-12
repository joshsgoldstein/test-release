"""
Chatbot implementation using LangGraph with memory functionality.
"""
import os
from typing import Dict, Any, List
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver
from typing_extensions import Annotated, TypedDict

# Load environment variables
load_dotenv()


class State(TypedDict):
    """State for the chatbot graph."""
    messages: Annotated[List[BaseMessage], add_messages]


class ChatbotWithMemory:
    """A chatbot implementation using LangGraph with conversation memory."""
    
    def __init__(self, model_name: str = "gpt-3.5-turbo"):
        """Initialize the chatbot with memory capabilities.
        
        Args:
            model_name: The OpenAI model to use for the chatbot
        """
        # Check if OpenAI API key is available
        if not os.getenv("OPENAI_API_KEY"):
            raise ValueError(
                "OPENAI_API_KEY environment variable is required. "
                "Please set it in your .env file or environment."
            )
        
        # Initialize the language model
        self.llm = ChatOpenAI(model=model_name, temperature=0.7)
        
        # Create memory saver for conversation history
        self.memory = MemorySaver()
        
        # Initialize the conversation graph
        self.graph = self._create_graph()
    
    def _create_graph(self) -> StateGraph:
        """Create the LangGraph conversation graph with memory."""
        
        # Create the prompt template
        prompt = ChatPromptTemplate.from_messages([
            ("system", 
             "You are a helpful assistant. You remember previous parts of our conversation. "
             "Be friendly, informative, and maintain context from our chat history."),
            MessagesPlaceholder(variable_name="messages"),
        ])
        
        # Create the chain
        chain = prompt | self.llm
        
        def call_model(state: State) -> Dict[str, Any]:
            """Call the model with the current state."""
            response = chain.invoke(state)
            return {"messages": response}
        
        # Build the graph
        workflow = StateGraph(State)
        workflow.add_node("model", call_model)
        workflow.set_entry_point("model")
        workflow.add_edge("model", END)
        
        # Compile the graph with memory
        return workflow.compile(checkpointer=self.memory)
    
    def chat(self, message: str, session_id: str = "default") -> str:
        """Send a message to the chatbot and get a response.
        
        Args:
            message: The user's message
            session_id: Session ID to maintain separate conversation histories
            
        Returns:
            The chatbot's response
        """
        # Create the input state
        input_state = {
            "messages": [HumanMessage(content=message)]
        }
        
        # Configure the thread
        config = {"configurable": {"thread_id": session_id}}
        
        # Get the response
        result = self.graph.invoke(input_state, config)
        
        # Extract and return the AI response
        ai_message = result["messages"][-1]
        return ai_message.content
    
    def get_conversation_history(self, session_id: str = "default") -> List[Dict[str, str]]:
        """Get the conversation history for a session.
        
        Args:
            session_id: Session ID to get history for
            
        Returns:
            List of messages in the conversation
        """
        config = {"configurable": {"thread_id": session_id}}
        
        try:
            # Get the current state
            state = self.graph.get_state(config)
            messages = state.values.get("messages", [])
            
            # Convert to readable format
            history = []
            for msg in messages:
                if isinstance(msg, HumanMessage):
                    history.append({"role": "user", "content": msg.content})
                elif isinstance(msg, AIMessage):
                    history.append({"role": "assistant", "content": msg.content})
            
            return history
        except Exception:
            return []
    
    def clear_history(self, session_id: str = "default") -> None:
        """Clear the conversation history for a session.
        
        Args:
            session_id: Session ID to clear history for
        """
        config = {"configurable": {"thread_id": session_id}}
        # Note: MemorySaver doesn't have a direct clear method,
        # so we'll create a new memory instance if needed
        # For now, this is a placeholder - in production you might want
        # to use a different memory implementation with clear functionality
        pass


if __name__ == "__main__":
    # Example usage
    try:
        chatbot = ChatbotWithMemory()
        
        print("Chatbot initialized successfully!")
        print("Example conversation:")
        
        # Test conversation
        response1 = chatbot.chat("Hello! My name is Alice.")
        print(f"User: Hello! My name is Alice.")
        print(f"Bot: {response1}")
        
        response2 = chatbot.chat("What's my name?")
        print(f"User: What's my name?")
        print(f"Bot: {response2}")
        
        # Show conversation history
        history = chatbot.get_conversation_history()
        print(f"\nConversation history: {len(history)} messages")
        
    except Exception as e:
        print(f"Error: {e}")
        print("Make sure to set your OPENAI_API_KEY in a .env file")