'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../../contexts/AuthContext'
import api from '../../../../services/api'

export default function MessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true)
        // Fetch conversations for the employer
        const response = await api.get('/messages/conversations')
        
        if (response.data && response.data.success) {
          setConversations(response.data.data)
          // If there are conversations, set the first one as active
          if (response.data.data.length > 0) {
            setActiveConversation(response.data.data[0])
            fetchMessages(response.data.data[0]._id)
          } else {
            setIsLoading(false)
          }
        } else {
          setError("Impossible de récupérer les conversations")
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Error fetching conversations:', err)
        setError("Une erreur s'est produite lors de la récupération des conversations")
        setIsLoading(false)
      }
    }

    const fetchMessages = async (conversationId) => {
      try {
        // Fetch messages for the active conversation
        const response = await api.get(`/messages/conversation/${conversationId}`)
        
        if (response.data && response.data.success) {
          setMessages(response.data.data)
        } else {
          setError("Impossible de récupérer les messages")
        }
      } catch (err) {
        console.error('Error fetching messages:', err)
        setError("Une erreur s'est produite lors de la récupération des messages")
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchConversations()
    }
  }, [user])

  const handleConversationSelect = async (conversation) => {
    setActiveConversation(conversation)
    setIsLoading(true)
    
    try {
      // Fetch messages for the selected conversation
      const response = await api.get(`/messages/conversation/${conversation._id}`)
      
      if (response.data && response.data.success) {
        setMessages(response.data.data)
      } else {
        setError("Impossible de récupérer les messages")
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError("Une erreur s'est produite lors de la récupération des messages")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !activeConversation) return
    
    try {
      // Send a new message
      const response = await api.post('/messages', {
        conversationId: activeConversation._id,
        content: newMessage
      })
      
      if (response.data && response.data.success) {
        // Add the new message to the messages list
        setMessages(prev => [...prev, response.data.data])
        setNewMessage('')
      } else {
        setError("Impossible d'envoyer le message")
      }
    } catch (err) {
      console.error('Error sending message:', err)
      setError("Une erreur s'est produite lors de l'envoi du message")
    }
  }

  if (isLoading && !activeConversation) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex h-[600px]">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Conversations</h2>
            </div>
            
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Aucune conversation
              </div>
            ) : (
              <ul>
                {conversations.map((conversation: any) => {
                  const otherUser = conversation.participants.find(p => p._id !== user?.id)
                  
                  return (
                    <li 
                      key={conversation._id}
                      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                        activeConversation?._id === conversation._id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleConversationSelect(conversation)}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                          {otherUser?.firstName?.charAt(0)}{otherUser?.lastName?.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {otherUser?.firstName} {otherUser?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {conversation.lastMessage?.content?.substring(0, 30)}
                            {conversation.lastMessage?.content?.length > 30 ? '...' : ''}
                          </p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <div className="ml-auto bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
          
          {/* Messages Area */}
          <div className="w-2/3 flex flex-col">
            {!activeConversation ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Sélectionnez une conversation pour afficher les messages
              </div>
            ) : (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                      {activeConversation.participants.find(p => p._id !== user?.id)?.firstName?.charAt(0)}
                      {activeConversation.participants.find(p => p._id !== user?.id)?.lastName?.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {activeConversation.participants.find(p => p._id !== user?.id)?.firstName} {activeConversation.participants.find(p => p._id !== user?.id)?.lastName}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Messages List */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Aucun message dans cette conversation
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message: any) => {
                        const isCurrentUser = message.sender === user?.id
                        
                        return (
                          <div 
                            key={message._id}
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <p>{message.content}</p>
                              <p className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                                {new Date(message.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                
                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tapez votre message..."
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white font-medium rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Envoyer
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
