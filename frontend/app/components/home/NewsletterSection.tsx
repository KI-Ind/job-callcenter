'use client'

import { useState } from 'react'
import { newsletterAPI } from '../../lib/api'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'success' | 'error' | 'duplicate'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  
  // Check if email exists in local storage
  const checkLocalSubscription = (email: string): boolean => {
    try {
      const storedSubscriptions = localStorage.getItem('newsletter_subscriptions')
      if (storedSubscriptions) {
        const subscriptions = JSON.parse(storedSubscriptions)
        return subscriptions.some((sub: string) => sub.toLowerCase() === email.toLowerCase())
      }
    } catch (error) {
      console.error('Error checking local subscriptions:', error)
    }
    return false
  }
  
  // Save email to local storage
  const saveLocalSubscription = (email: string): void => {
    try {
      const storedSubscriptions = localStorage.getItem('newsletter_subscriptions')
      let subscriptions = []
      
      if (storedSubscriptions) {
        subscriptions = JSON.parse(storedSubscriptions)
      }
      
      if (!subscriptions.includes(email.toLowerCase())) {
        subscriptions.push(email.toLowerCase())
        localStorage.setItem('newsletter_subscriptions', JSON.stringify(subscriptions))
      }
    } catch (error) {
      console.error('Error saving local subscription:', error)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) return
    
    // Check if already subscribed locally
    if (checkLocalSubscription(email)) {
      setSubscriptionStatus('duplicate')
      setErrorMessage('Cet email est déjà inscrit à notre newsletter.')
      return
    }
    
    setIsSubmitting(true)
    setErrorMessage('')
    
    try {
      // Call the newsletter API to store the email in the database
      await newsletterAPI.subscribe(email)
      
      // If successful, save to local storage and update UI
      saveLocalSubscription(email)
      setSubscriptionStatus('success')
      setEmail('')
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      
      // Check if this is a duplicate email error
      if (error instanceof Error && 
          (error.message === 'Cet email est déjà inscrit à notre newsletter.' ||
           error.message.includes('already exists') ||
           error.message.includes('duplicate') ||
           error.message.includes('already subscribed'))) {
        setSubscriptionStatus('duplicate')
        setErrorMessage('Cet email est déjà inscrit à notre newsletter.')
      } else if (error instanceof Error && 
                error.message.includes('Impossible de se connecter au serveur')) {
        // Handle server connection errors
        setSubscriptionStatus('error')
        setErrorMessage('Impossible de se connecter au serveur. Veuillez réessayer plus tard.')
      } else {
        setSubscriptionStatus('error')
        
        // Set a more specific error message if available
        if (error instanceof Error) {
          setErrorMessage(error.message)
        }
      }
    } finally {
      setIsSubmitting(false)
      
      // Reset status after 5 seconds
      setTimeout(() => {
        setSubscriptionStatus('idle')
      }, 5000)
    }
  }
  
  return (
    <section className="py-12 bg-blue-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold mb-3">Restez informé des nouvelles opportunités</h2>
        <p className="mb-6">
          Inscrivez-vous à notre newsletter pour recevoir les dernières offres d&apos;emploi et 
          conseils de carrière
        </p>
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            placeholder="Votre adresse email"
            className="flex-grow px-4 py-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-white text-blue-600 hover:bg-gray-100 font-medium py-2 px-6 rounded-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>
        
        {subscriptionStatus === 'success' && (
          <p className="mt-4 text-sm text-green-200">
            Merci pour votre inscription ! Vous recevrez bientôt nos actualités.
          </p>
        )}
        
        {subscriptionStatus === 'duplicate' && (
          <p className="mt-4 text-sm text-yellow-200">
            {errorMessage || 'Cet email est déjà inscrit à notre newsletter.'}
          </p>
        )}
        
        {subscriptionStatus === 'error' && (
          <p className="mt-4 text-sm text-red-200">
            {errorMessage || 'Une erreur est survenue. Veuillez réessayer ultérieurement.'}
          </p>
        )}
        
        <p className="mt-4 text-xs opacity-80">
          En vous inscrivant, vous acceptez de recevoir nos emails et confirmez avoir lu notre politique de confidentialité.
        </p>
      </div>
    </section>
  )
}
