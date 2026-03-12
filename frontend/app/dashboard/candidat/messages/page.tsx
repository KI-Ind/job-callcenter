'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../../../contexts/AuthContext'
import { api } from '../../../../services/api'

export default function MessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [currentConversation, setCurrentConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (currentConversation) {
      fetchMessages(currentConversation.id)
    }
  }, [currentConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchConversations = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await api.get('/candidat/conversations')
      
      if (response.data && response.data.success) {
        setConversations(response.data.data)
        
        // Set first conversation as current if available
        if (response.data.data.length > 0 && !currentConversation) {
          setCurrentConversation(response.data.data[0])
        }
      } else {
        setError(response.data?.message || 'Une erreur est survenue lors de la récupération de vos conversations')
      }
    } catch (err) {
      console.error('Error fetching conversations:', err)
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la récupération de vos conversations')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (conversationId) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await api.get(`/candidat/conversations/${conversationId}/messages`)
      
      if (response.data && response.data.success) {
        setMessages(response.data.data)
      } else {
        setError(response.data?.message || 'Une erreur est survenue lors de la récupération des messages')
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la récupération des messages')
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !currentConversation) return
    
    try {
      setIsSending(true)
      setError(null)
      
      const response = await api.post(`/candidat/conversations/${currentConversation.id}/messages`, {
        content: newMessage
      })
      
      if (response.data && response.data.success) {
        setMessages([...messages, response.data.data])
        setNewMessage('')
      } else {
        setError(response.data?.message || "Une erreur s'est produite lors de l'envoi du message")
      }
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err.response?.data?.message || "Une erreur s'est produite lors de l'envoi du message")
    } finally {
      setIsSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="flex h-[calc(80vh-150px)]">
          {/* Conversations list */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Conversations</h2>
            </div>
            
            {isLoading && !currentConversation ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Aucune conversation disponible.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {conversations.map((conversation) => (
                  <li key={conversation.id}>
                    <button
                      onClick={() => setCurrentConversation(conversation)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                        currentConversation?.id === conversation.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            {conversation.employer.company || conversation.employer.firstName + ' ' + conversation.employer.lastName}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {conversation.jobTitle || 'Discussion générale'}
                          </p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {conversation.lastMessage ? conversation.lastMessage.substring(0, 30) + (conversation.lastMessage.length > 30 ? '...' : '') : 'Pas de message'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {conversation.updatedAt ? formatDate(conversation.updatedAt) : ''}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Messages */}
          <div className="w-2/3 flex flex-col">
            {currentConversation ? (
              <>
                {/* Conversation header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        {currentConversation.employer.company || currentConversation.employer.firstName + ' ' + currentConversation.employer.lastName}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {currentConversation.jobTitle || 'Discussion générale'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Messages list */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Aucun message dans cette conversation.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs sm:max-w-md rounded-lg px-4 py-2 ${
                              message.senderId === user?.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${message.senderId === user?.id ? 'text-blue-200' : 'text-gray-500'}`}>
                              {formatDate(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
                
                {/* Message input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={sendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Tapez votre message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={isSending || !newMessage.trim()}
                      className={`px-4 py-2 rounded-md font-medium text-white ${
                        isSending || !newMessage.trim()
                          ? 'bg-blue-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isSending ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Envoi...
                        </span>
                      ) : (
                        'Envoyer'
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Sélectionnez une conversation pour afficher les messages.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
