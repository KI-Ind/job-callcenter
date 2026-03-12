import HeroSection from './components/home/HeroSection'
import KeyFiguresSection from './components/home/KeyFiguresSection'
import CategoriesSection from './components/home/CategoriesSection'
import RecentJobsSection from './components/home/RecentJobsSection'
import RecruitingCentersSection from './components/home/RecruitingCentersSection'
import TestimonialsSection from './components/home/TestimonialsSection'
import FaqSection from './components/home/FaqSection'
import NewsletterSection from './components/home/NewsletterSection'

export default function Home() {
  return (
    <>
      <HeroSection />
      <KeyFiguresSection />
      <CategoriesSection />
      <RecentJobsSection />
      <RecruitingCentersSection />
      <TestimonialsSection />
      <FaqSection />
      <NewsletterSection />
    </>
  )
}
