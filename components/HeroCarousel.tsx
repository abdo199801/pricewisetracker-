"use client"

import { useState, useEffect } from 'react'
import { Carousel } from 'react-responsive-carousel'
import "react-responsive-carousel/lib/styles/carousel.min.css"
import Image from "next/image"
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, Pause, Zap, Shield, Truck, RefreshCw } from 'lucide-react'

const heroImages = [
  { 
    imgUrl: '/assets/images/hero-1.svg', 
    alt: 'smartwatch',
    title: 'Smart Wearables',
    description: 'Track your fitness with advanced smartwatches',
    badge: 'Best Seller'
  },
  { 
    imgUrl: '/assets/images/hero-2.svg', 
    alt: 'bag',
    title: 'Premium Bags',
    description: 'Style meets functionality in every design',
    badge: 'New Arrival'
  },
  { 
    imgUrl: '/assets/images/hero-3.svg', 
    alt: 'lamp',
    title: 'Modern Lighting',
    description: 'Illuminate your space with smart lighting',
    badge: 'Trending'
  },
  { 
    imgUrl: '/assets/images/hero-4.svg', 
    alt: 'air fryer',
    title: 'Smart Kitchen',
    description: 'Cook healthier with intelligent appliances',
    badge: 'Sale'
  },
  { 
    imgUrl: '/assets/images/hero-5.svg', 
    alt: 'chair',
    title: 'Ergonomic Furniture',
    description: 'Work in comfort with ergonomic designs',
    badge: 'Limited Time'
  },
]

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    if (isAutoPlaying && !isHovering) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroImages.length)
      }, 4000)
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

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Stats Bar */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-8 py-3"
          >
            {[
              { icon: Zap, text: 'Lightning Fast Delivery', subtext: 'Within 24 hours' },
              { icon: Shield, text: 'Secure Payment', subtext: '100% Safe' },
              { icon: Truck, text: 'Free Shipping', subtext: 'Over $50' },
              { icon: RefreshCw, text: 'Easy Returns', subtext: '30 Days Policy' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg"
              >
                <div className="p-2 bg-gradient-to-r from-primary to-primary-light rounded-lg">
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{stat.text}</p>
                  <p className="text-xs text-gray-600">{stat.subtext}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        
        {/* Animated Border */}
        <motion.div
          className="absolute inset-0 rounded-3xl p-[2px]"
          style={{
            background: 'linear-gradient(45deg, #3B82F6, #8B5CF6, #EC4899)'
          }}
          animate={{
            background: [
              'linear-gradient(45deg, #3B82F6, #8B5CF6, #EC4899)',
              'linear-gradient(45deg, #EC4899, #3B82F6, #8B5CF6)',
              'linear-gradient(45deg, #8B5CF6, #EC4899, #3B82F6)',
            ]
          }}
          transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
        />
        
        <div className="relative p-8">
          <Carousel
            showThumbs={false}
            showArrows={false}
            showStatus={false}
            selectedItem={currentSlide}
            onChange={handleSlideChange}
            infiniteLoop
            className="relative z-10"
          >
            {heroImages.map((image, index) => (
              <div key={image.alt} className="relative">
                <div className="grid md:grid-cols-2 gap-8 items-center min-h-[500px]">
                  {/* Content */}
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <div>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block px-4 py-1 bg-gradient-to-r from-primary to-primary-light text-white text-sm font-semibold rounded-full"
                      >
                        {image.badge}
                      </motion.span>
                    </div>
                    
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight"
                    >
                      Discover <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        {image.title}
                      </span>
                    </motion.h1>
                    
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-xl text-gray-600"
                    >
                      {image.description}
                    </motion.p>
                  </motion.div>
                  
                  {/* Image */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="relative"
                  >
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-3xl blur-xl" />
                    <Image
                      src={image.imgUrl}
                      alt={image.alt}
                      width={600}
                      height={600}
                      className="relative object-contain drop-shadow-2xl"
                      priority={index === 0}
                    />
                    
                    {/* Floating Elements */}
                    <AnimatePresence>
                      {currentSlide === index && (
                        <>
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.7 }}
                            className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg shadow-lg"
                          >
                            <span className="font-bold">-30%</span>
                          </motion.div>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.8 }}
                            className="absolute -bottom-4 -left-4 bg-white px-4 py-2 rounded-lg shadow-lg border"
                          >
                            <span className="text-sm font-semibold text-gray-900">🔥 Trending</span>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </div>
            ))}
          </Carousel>

          {/* Custom Controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              {/* Auto Play Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleAutoPlay}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {isAutoPlaying ? (
                  <Pause className="w-4 h-4 text-gray-700" />
                ) : (
                  <Play className="w-4 h-4 text-gray-700" />
                )}
              </motion.button>

              {/* Navigation Dots */}
              <div className="flex gap-2">
                {heroImages.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`relative w-2 h-2 rounded-full transition-all ${
                      currentSlide === index 
                        ? 'bg-gradient-to-r from-primary to-primary-light w-8' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                  >
                    {currentSlide === index && (
                      <motion.div
                        layoutId="activeDot"
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-primary-light"
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Slide Counter */}
              <div className="text-sm font-medium text-gray-700">
                {currentSlide + 1} / {heroImages.length}
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <AnimatePresence>
            {isHovering && (
              <>
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-shadow"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-shadow"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </motion.button>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hand Drawn Arrow */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="absolute -left-20 bottom-10 z-10 hidden lg:block"
      >
        <Image 
          src="/assets/icons/hand-drawn-arrow.svg"
          alt="arrow"
          width={200}
          height={200}
          className="object-contain"
        />
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-4 left-4 text-sm font-semibold text-primary"
        >
          put your product link 
        </motion.div>
      </motion.div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 overflow-hidden rounded-b-3xl">
        <motion.div
          animate={{ width: isAutoPlaying ? '100%' : '0%' }}
          transition={{ 
            duration: 4, 
            repeat: isAutoPlaying ? Infinity : 0,
            ease: "linear" 
          }}
          className="h-full bg-gradient-to-r from-primary to-primary-light"
        />
      </div>
    </div>
  )
}

export default HeroCarousel