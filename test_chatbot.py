#!/usr/bin/env python3
"""
Simple test script for the chatbot implementation.
"""
import os
import sys
from unittest.mock import patch, MagicMock

def test_imports():
    """Test that all required modules can be imported."""
    try:
        from chatbot import ChatbotWithMemory
        print("✅ Successfully imported ChatbotWithMemory")
        return True
    except ImportError as e:
        print(f"❌ Failed to import modules: {e}")
        return False

def test_initialization_without_api_key():
    """Test that initialization fails gracefully without API key."""
    try:
        # Temporarily remove API key
        original_key = os.environ.get('OPENAI_API_KEY')
        if 'OPENAI_API_KEY' in os.environ:
            del os.environ['OPENAI_API_KEY']
        
        from chatbot import ChatbotWithMemory
        
        try:
            ChatbotWithMemory()
            print("❌ Should have failed without API key")
            return False
        except ValueError as e:
            if "OPENAI_API_KEY" in str(e):
                print("✅ Correctly fails without API key")
                return True
            else:
                print(f"❌ Unexpected error: {e}")
                return False
    except Exception as e:
        print(f"❌ Unexpected error in test: {e}")
        return False
    finally:
        # Restore original API key
        if original_key:
            os.environ['OPENAI_API_KEY'] = original_key

def test_mock_functionality():
    """Test chatbot functionality with mocked OpenAI API."""
    try:
        # Mock the OpenAI API
        with patch.dict(os.environ, {'OPENAI_API_KEY': 'test_key'}):
            with patch('chatbot.ChatOpenAI') as mock_llm:
                # Create a mock response
                mock_ai_message = MagicMock()
                mock_ai_message.content = "Hello! I'm a test response."
                
                mock_chain = MagicMock()
                mock_chain.invoke.return_value = mock_ai_message
                
                # Mock the LLM creation and chaining
                mock_llm_instance = MagicMock()
                mock_llm.return_value = mock_llm_instance
                
                # Mock the prompt template and chain
                with patch('chatbot.ChatPromptTemplate') as mock_prompt:
                    mock_prompt_instance = MagicMock()
                    mock_prompt_instance.__or__ = lambda x: mock_chain
                    mock_prompt.from_messages.return_value = mock_prompt_instance
                    
                    from chatbot import ChatbotWithMemory
                    
                    # This should work with mocked dependencies
                    bot = ChatbotWithMemory()
                    print("✅ Successfully created chatbot with mocked API")
                    
                    # Test state structure
                    from chatbot import State
                    test_state = State(messages=[])
                    print("✅ State structure is valid")
                    
                    return True
                    
    except Exception as e:
        print(f"❌ Error in mock test: {e}")
        return False

def main():
    """Run all tests."""
    print("🧪 Testing Chatbot Implementation")
    print("=" * 40)
    
    tests = [
        ("Import test", test_imports),
        ("API key validation", test_initialization_without_api_key),
        ("Mock functionality", test_mock_functionality),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Running {test_name}...")
        try:
            if test_func():
                passed += 1
            else:
                print(f"❌ {test_name} failed")
        except Exception as e:
            print(f"❌ {test_name} error: {e}")
    
    print(f"\n📊 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("✅ All tests passed!")
        return 0
    else:
        print("❌ Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())