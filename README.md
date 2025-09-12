# Chatbot with Memory (LangGraph)

A chatbot implementation using LangGraph with conversation memory functionality. The chatbot can remember previous conversations and maintain context across multiple interactions.

## Features

- 🧠 **Memory**: Remembers conversation history within sessions
- 🔧 **LangGraph**: Built using LangGraph for stateful conversation management
- 💬 **Interactive CLI**: Easy-to-use command-line interface
- 🎯 **Session Management**: Supports multiple conversation sessions
- 🔑 **OpenAI Integration**: Uses OpenAI's GPT models for responses

## Requirements

- Python 3.8+
- OpenAI API key

## Installation

1. Clone this repository:
```bash
git clone https://github.com/joshsgoldstein/test-release.git
cd test-release
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up your OpenAI API key:
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

## Usage

### CLI Interface

Run the interactive chatbot:
```bash
python cli.py
```

Available commands in the CLI:
- `/help` - Show help message
- `/history` - Display conversation history
- `/clear` - Clear conversation history
- `/quit` or `/exit` - Exit the chatbot

### Python API

Use the chatbot in your own code:

```python
from chatbot import ChatbotWithMemory

# Initialize the chatbot
bot = ChatbotWithMemory()

# Start a conversation
response = bot.chat("Hello! My name is Alice.", session_id="user123")
print(response)

# Continue the conversation (bot remembers previous context)
response = bot.chat("What's my name?", session_id="user123")
print(response)  # Should remember that your name is Alice

# Get conversation history
history = bot.get_conversation_history("user123")
for msg in history:
    print(f"{msg['role']}: {msg['content']}")
```

## Architecture

The chatbot is built using:

- **LangGraph**: For creating stateful conversation graphs
- **LangChain**: For LLM integration and prompt management
- **MemorySaver**: For persistent conversation memory
- **OpenAI GPT**: As the underlying language model

The conversation state is managed through LangGraph's state management system, allowing the bot to maintain context across multiple turns in a conversation.

## Configuration

You can customize the chatbot by modifying the `ChatbotWithMemory` class:

- **Model**: Change the OpenAI model (default: `gpt-3.5-turbo`)
- **Temperature**: Adjust response creativity (default: `0.7`)
- **System Prompt**: Modify the bot's personality and behavior

## Example

```bash
$ python cli.py

🤖 Chatbot with Memory (LangGraph)
========================================
✅ Chatbot initialized successfully!

Type /help for commands or start chatting!
Type /quit to exit

You: Hi, I'm working on a Python project
Bot: Hello! It's great to meet you. I'd be happy to help with your Python project. What kind of project are you working on, and is there anything specific you'd like assistance with?

You: It's a web scraper using BeautifulSoup
Bot: That sounds like an interesting project! BeautifulSoup is an excellent library for web scraping. Since you mentioned you're working on a web scraper, are you facing any particular challenges with it? For example:

- Parsing specific HTML elements
- Handling different webpage structures
- Dealing with dynamic content
- Managing requests and response handling

I'm here to help with any questions you might have about your BeautifulSoup web scraper!

You: /history
📜 Conversation History (4 messages):
----------------------------------------
1. You: Hi, I'm working on a Python project
2. Bot: Hello! It's great to meet you. I'd be happy to help with your Python project...
3. You: It's a web scraper using BeautifulSoup
4. Bot: That sounds like an interesting project! BeautifulSoup is an excellent library...
----------------------------------------
```

## License

This project is open source and available under the MIT License.