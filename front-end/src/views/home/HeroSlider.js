import React, { useState, useEffect } from 'react';
import { FaEdit } from 'react-icons/fa';
import '../../style/viewsStyle/home.css';

function HeroSlider({ slides, handleUpdate, userRole }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showFullDescription, setShowFullDescription] = useState(false); // State to toggle full/short description


    // Go to the next slide
    const nextSlide = () => {
        if (currentIndex === slides.length - 1) {
            setCurrentIndex(0); // Loop back to the first slide
        } else {
            setCurrentIndex(currentIndex + 1);
        }
        setShowFullDescription(false); // Reset description view when navigating slides

    };

    // Go to the previous slide
    const prevSlide = () => {
        if (currentIndex === 0) {
            setCurrentIndex(slides.length - 1); // Go to the last slide
        } else {
            setCurrentIndex(currentIndex - 1);
        }
        setShowFullDescription(false); // Reset description view when navigating slides

    };
        // Toggle description display
        const toggleDescription = () => {
            setShowFullDescription(!showFullDescription);
        };

    useEffect(() => {
        // Automatically move to the next slide after 5 seconds
        const slideInterval = setInterval(nextSlide, 5000);
        return () => clearInterval(slideInterval); // Clean up the interval on unmount
    }, [currentIndex]);

    // Ensure only 3 slides are shown
    const visibleSlides = slides.slice(0, 3);

    return (
        <div className="hero-slider mt-2">
            <div className="hero-slide" style={{ backgroundImage: `url(${visibleSlides[currentIndex].image_url})` }}>
                <div className="overlay"></div>
                <div className="content">
                    <h2 className=''>{visibleSlides[currentIndex].headline}</h2>
                    <p>
                        {showFullDescription
                            ? visibleSlides[currentIndex].description
                            : `${visibleSlides[currentIndex].description.slice(0, 30)}...`}
                    </p>
                     <div class="d-flex justify-content-center align-items-center column-gap-2">      
                    <button className="btn btnSlide btn-warning" onClick={toggleDescription}>
                        {showFullDescription ? 'Read Less' : 'Read More'}
                    </button>

                    {/* Show edit button for admin or employee */}
                    {(userRole === 'admin' || userRole === 'employe') && (
                        <button
                            className="edit-btn btn btnSlide"
                            type="button"
                            onClick={() => handleUpdate(visibleSlides[currentIndex].id)} // Edit the current slide
                        >
                            <FaEdit /> Edit Slide 
                        </button>
                    )}
                    </div> 
                </div>
            </div>
             <div class="d-flex ">
            {/* Previous Button */}
            <button className="changeSlideBtn prev-btn" onClick={prevSlide}>
                &#10094;
            </button>

            {/* Next Button */}
            <button className="changeSlideBtn next-btn" onClick={nextSlide}>
                &#10095;
            </button>    
            </div>       
            

            {/* Dots for navigation */}
            <div className="dots">
                {visibleSlides.map((slide, index) => (
                    <span
                        key={index}
                        className={`dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(index)}
                    ></span>
                ))}
            </div>
        </div>
    );
}

export default HeroSlider;
