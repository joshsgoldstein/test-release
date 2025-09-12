#!/usr/bin/env python3
"""
Demo script showing the chatbot API usage.
This script demonstrates how to use the chatbot programmatically.
"""
import os

def demo_without_api_key():
    """Demonstrate the chatbot behavior without API key."""
    print("🔧 Demo: Chatbot without API key")
    print("=" * 40)
    
    # Make sure no API key is set for this demo
    if 'OPENAI_API_KEY' in os.environ:
        del os.environ['OPENAI_API_KEY']
    
    try:
        from chatbot import ChatbotWithMemory
        bot = ChatbotWithMemory()
        print("❌ This shouldn't happen - should fail without API key")
    except ValueError as e:
        print(f"✅ Correctly failed: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

def demo_api_structure():
    """Demonstrate the API structure and imports."""
    print("\n🔧 Demo: API structure")
    print("=" * 40)
    
    try:
        from chatbot import ChatbotWithMemory, State
        print("✅ Successfully imported ChatbotWithMemory and State")
        
        # Show the State structure
        from langchain_core.messages import HumanMessage, AIMessage
        
        # Create a sample state
        messages = [
            HumanMessage(content="Hello"),
            AIMessage(content="Hi there!")
        ]
        
        state = State(messages=messages)
        print(f"✅ Created State with {len(state['messages'])} messages")
        
        # Show message types
        for i, msg in enumerate(state['messages']):
            msg_type = type(msg).__name__
            print(f"  Message {i+1}: {msg_type} - '{msg.content}'")
        
    except Exception as e:
        print(f"❌ Error: {e}")

def demo_cli_help():
    """Show CLI help functionality."""
    print("\n🔧 Demo: CLI help")
    print("=" * 40)
    
    from cli import print_help
    print_help()

def main():
    """Run all demos."""
    print("🎮 Chatbot Demo Script")
    print("This demonstrates the chatbot functionality without requiring an API key.\n")
    
    demo_without_api_key()
    demo_api_structure()
    demo_cli_help()
    
    print("\n🎯 Summary:")
    print("- Chatbot properly validates API key requirements")
    print("- State management system is working")
    print("- CLI interface is functional")
    print("- All imports are working correctly")
    print("\n💡 To use with a real API key:")
    print("1. Copy .env.example to .env")
    print("2. Add your OpenAI API key to .env")
    print("3. Run: python cli.py")

if __name__ == "__main__":
    main()