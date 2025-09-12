#!/usr/bin/env python3
"""
CLI interface for the chatbot with memory.
"""
import sys
import os
from chatbot import ChatbotWithMemory


def print_help():
    """Print help information."""
    print("\nAvailable commands:")
    print("  /help    - Show this help message")
    print("  /history - Show conversation history")
    print("  /clear   - Clear conversation history")
    print("  /quit    - Exit the chatbot")
    print("  /exit    - Exit the chatbot")
    print("\nJust type your message to chat with the bot!")


def main():
    """Main CLI interface."""
    print("🤖 Chatbot with Memory (LangGraph)")
    print("=" * 40)
    
    # Initialize chatbot
    try:
        chatbot = ChatbotWithMemory()
        print("✅ Chatbot initialized successfully!")
    except Exception as e:
        print(f"❌ Failed to initialize chatbot: {e}")
        print("\n💡 Make sure to:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Set up your OpenAI API key in a .env file")
        print("3. Copy .env.example to .env and add your key")
        return 1
    
    print("\nType /help for commands or start chatting!")
    print("Type /quit to exit\n")
    
    session_id = "cli_session"
    
    while True:
        try:
            # Get user input
            user_input = input("You: ").strip()
            
            # Handle empty input
            if not user_input:
                continue
            
            # Handle commands
            if user_input.lower() in ['/quit', '/exit']:
                print("👋 Goodbye!")
                break
            elif user_input.lower() == '/help':
                print_help()
                continue
            elif user_input.lower() == '/history':
                history = chatbot.get_conversation_history(session_id)
                if history:
                    print(f"\n📜 Conversation History ({len(history)} messages):")
                    print("-" * 40)
                    for i, msg in enumerate(history, 1):
                        role = "You" if msg["role"] == "user" else "Bot"
                        print(f"{i}. {role}: {msg['content']}")
                    print("-" * 40)
                else:
                    print("📜 No conversation history yet.")
                continue
            elif user_input.lower() == '/clear':
                chatbot.clear_history(session_id)
                print("🗑️  Conversation history cleared.")
                continue
            
            # Get bot response
            print("Bot: ", end="", flush=True)
            try:
                response = chatbot.chat(user_input, session_id)
                print(response)
            except Exception as e:
                print(f"❌ Error getting response: {e}")
        
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except EOFError:
            print("\n👋 Goodbye!")
            break
    
    return 0


if __name__ == "__main__":
    sys.exit(main())