"use client"

import { useState, useEffect } from 'react'
import { Carousel } from 'react-responsive-carousel'
import "react-responsive-carousel/lib/styles/carousel.min.css"
import Image from "next/image"
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'

const heroImages = [
  { 
    imgUrl: '/assets/images/hero-1.svg', 
    alt: 'smartwatch',
    title: 'Smart Wearables',
    description: 'Track your fitness with advanced smartwatches',
    accentColor: 'from-blue-600 to-cyan-500'
  },
  { 
    imgUrl: '/assets/images/hero-2.svg', 
    alt: 'bag',
    title: 'Premium Bags',
    description: 'Style meets functionality in every design',
    accentColor: 'from-emerald-600 to-teal-500'
  },
  { 
    imgUrl: '/assets/images/hero-3.svg', 
    alt: 'lamp',
    title: 'Modern Lighting',
    description: 'Illuminate your space with smart lighting',
    accentColor: 'from-amber-600 to-orange-500'
  },
  { 
    imgUrl: '/assets/images/hero-4.svg', 
    alt: 'air fryer',
    title: 'Smart Kitchen',
    description: 'Cook healthier with intelligent appliances',
    accentColor: 'from-rose-600 to-pink-500'
  },
  { 
    imgUrl: '/assets/images/hero-5.svg', 
    alt: 'chair',
    title: 'Ergonomic Furniture',
    description: 'Work in comfort with ergonomic designs',
    accentColor: 'from-violet-600 to-purple-500'
  },
]

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isAutoPlaying && !isHovering) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroImages.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isAutoPlaying, isHovering])

  const handleSlideChange = (index: number) => {
    setCurrentSlide(index)
  }

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)
  }

  const currentImage = heroImages[currentSlide]

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div 
        className="relative overflow-hidden rounded-lg lg:rounded-xl xl:rounded-2xl shadow-lg"
        onMouseEnter={() => !isMobile && setIsHovering(true)}
        onMouseLeave={() => !isMobile && setIsHovering(false)}
      >
        {/* Subtle Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />
        
        {/* Accent Border */}
        <div className={`absolute inset-0 rounded-lg lg:rounded-xl xl:rounded-2xl border ${currentImage.accentColor.split(' ')[0].replace('from-', 'border-')}/10`} />
        
        <div className="relative p-4 sm:p-6 lg:p-8 xl:p-10">
          <Carousel
            showThumbs={false}
            showArrows={false}
            showStatus={false}
            selectedItem={currentSlide}
            onChange={handleSlideChange}
            infiniteLoop
            className="relative"
            swipeable={true}
            emulateTouch={true}
            autoPlay={isAutoPlaying}
            interval={5000}
            stopOnHover={false}
          >
            {heroImages.map((image, index) => (
              <div key={image.alt} className="relative">
                <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center min-h-[280px] sm:min-h-[350px] lg:min-h-[450px]">
                  {/* Content */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="space-y-4 sm:space-y-6 order-2 lg:order-1 text-center lg:text-left"
                  >
                    <div className="space-y-3 sm:space-y-4">
                      <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight tracking-tight"
                      >
                        Discover{' '}
                        <span className={`block lg:inline bg-gradient-to-r ${image.accentColor} bg-clip-text text-transparent`}>
                          {image.title}
                        </span>
                      </motion.h1>
                      
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0"
                      >
                        {image.description}
                      </motion.p>
                    </div>
                    
                    {/* Minimal Indicator */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center justify-center lg:justify-start gap-2 pt-2"
                    >
                      <div className="text-xs font-medium text-gray-500">
                        Slide {index + 1} of {heroImages.length}
                      </div>
                    </motion.div>
                  </motion.div>
                  
                  {/* Image Container */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative order-1 lg:order-2"
                  >
                    {/* Floating Background Effect */}
                    <div className={`absolute -inset-4 sm:-inset-6 bg-gradient-to-r ${image.accentColor} opacity-5 rounded-2xl blur-xl`} />
                    
                    {/* Main Image */}
                    <div className="relative">
                      <Image
                        src={image.imgUrl}
                        alt={image.alt}
                        width={isMobile ? 280 : 500}
                        height={isMobile ? 280 : 500}
                        className="relative w-full max-w-[240px] sm:max-w-[320px] lg:max-w-[400px] xl:max-w-[500px] mx-auto object-contain filter drop-shadow-xl"
                        priority={index === 0}
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            ))}
          </Carousel>

          {/* Minimal Navigation Controls */}
          <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-100">
              {/* Auto Play Toggle */}
              <button
                onClick={toggleAutoPlay}
                className={`p-1.5 rounded-full transition-colors ${
                  isAutoPlaying ? 'bg-gray-100 text-gray-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
                aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
              >
                {isAutoPlaying ? (
                  <Pause className="w-3.5 h-3.5" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Navigation Dots */}
              <div className="flex gap-1.5">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      currentSlide === index 
                        ? `${currentImage.accentColor.split(' ')[0].replace('from-', 'bg-')} w-4`
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Slide Counter */}
              <div className="text-xs font-medium text-gray-600">
                {currentSlide + 1}/{heroImages.length}
              </div>
            </div>
          </div>

          {/* Navigation Arrows - Only show on hover for desktop */}
          <AnimatePresence>
            {(isMobile || isHovering) && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 sm:p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 sm:p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Progress Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 overflow-hidden">
          <motion.div
            animate={{ width: isAutoPlaying ? '100%' : '0%' }}
            transition={{ 
              duration: 5, 
              repeat: isAutoPlaying ? Infinity : 0,
              ease: "linear" 
            }}
            className={`h-full ${currentImage.accentColor.replace('from-', 'bg-gradient-to-r ')}`}
          />
        </div>
      </div>
    </div>
  )
}

export default HeroCarousel