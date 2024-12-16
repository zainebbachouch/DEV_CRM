

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import '../../style/viewsStyle/home.css';
import axios from 'axios';
import HeroSlider from './HeroSlider';
import { FaEdit } from 'react-icons/fa';
import Modals from './SectionModal'; // Correctly importing the modals
import ResponsibleCards from './ResponsibleCards';
import Chatbot from '../chatbot/Chatbot ';
import FeedbackForm from './FeedbackForm ';
const { HeroSectionModal, StorySectionModal } = Modals;

function Home() {
  const userRole = localStorage.getItem('role');
  const [heroData, setHeroData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noData, setNoData] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState(null); // Store selected slide object
  const [showModal, setShowModal] = useState(false); // State to show or hide modal
  const [storyData, setStoryData] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showStoryModal, setShowStoryModal] = useState(false); // For Story Section





  const token = localStorage.getItem('token');
  const config = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  const fetchHeroSection = useCallback(async () => {
    setIsLoading(true);
    setNoData(false);

    try {
      const response = await axios.get('http://127.0.0.1:4000/api/allhero_section', config);
      if (response.data.heroSections && response.data.heroSections.length > 0) {
        setHeroData(response.data.heroSections);
      } else {
        setHeroData([]);
        setNoData(true);
      }
    } catch (err) {
      console.error('Error fetching hero section:', err);
      setHeroData([]);
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  useEffect(() => {
    fetchHeroSection();
  }, [fetchHeroSection]);

  const handleUpdate = (slideId) => {
    // Find the selected slide by its ID
    const selectedSlide = heroData.find((slide) => slide.id === slideId);
    setSelectedSlide(selectedSlide); // Set the selected slide in state
    setShowModal(true); // Show the modal
  };

  const handleCloseModal = () => {
    setShowModal(false); // Hide modal
  };
  const fetchStorySection = useCallback(async () => {
    try {
      const response = await axios.get('http://127.0.0.1:4000/api/allstory_section', config);
      setStoryData(response.data.storySections);
    } catch (error) {
      console.error('Error fetching story section:', error);
    }
  }, [config]);

  useEffect(() => {
    fetchStorySection();
  }, [fetchStorySection]);

  const handleUpdateStory = (storyId) => {
    const selectedStory = storyData.find(story => story.id === storyId);
    console.log('Selected Story:', selectedStory); // Log to ensure the correct story is selected
    setSelectedStory(selectedStory);
    setShowStoryModal(true);
  };

  const handleCloseStoryModal = () => {
    setShowStoryModal(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (noData) {
    return <div>No hero section data available. Add some data to the table.</div>;
  }

  return (
    <div className="d-flex flex-column mainContent ">
      <SideBar />
      <div className="d-flex container-fluid m-0 p-0 mainContent flex-column ">
        <TopBar />
        <div className="container-fluid p-0 m-0 ">
          {/* Pass handleUpdate and userRole to HeroSlider */}
          {heroData.length > 0 && <HeroSlider slides={heroData} handleUpdate={handleUpdate} userRole={userRole} />}

          {/* Modal to Edit Hero Section   <HeroSectionModal
            show={showModal} // State to show or hide modal
            handleClose={handleCloseModal} // Function to close modal
            heroData={selectedSlide} // Pass the selected slide to the modal
            fetchHeroSection={fetchHeroSection} // To re-fetch data after editing
          /> */}
          <HeroSectionModal
            show={showModal} // State to show or hide modal
            handleClose={handleCloseModal} // Function to close modal
            heroData={selectedSlide} // Pass the selected slide to the modal
            fetchHeroSection={fetchHeroSection} // To re-fetch data after editing
          />

        </div>
        {/* Section 1: Story */}
        {storyData.length > 0 && (
          <div className="section-1 mt-9">
            <div className="section-content mt-1">
              <h2>{storyData[0].title}</h2>
              <div
                dangerouslySetInnerHTML={{ __html: storyData[0].paragraph }}
              ></div>
              {(userRole === 'admin' || userRole === 'employe') && (
                <button
                  type="button"
                  className="btn"
                  id="editStoryBtn"
                  onClick={() => handleUpdateStory(storyData[0].id)}
                >
                  <FaEdit /> Edit Story
                </button>
              )}
            </div>
            <img
              className="imageHeroSection"
              src={storyData[0].image_url}
              alt="Our Story"
            />
          </div>
        )}


        <StorySectionModal
          show={showStoryModal}
          handleClose={handleCloseStoryModal}
          storyData={selectedStory}
          fetchStorySection={fetchStorySection}
        />
        <ResponsibleCards />
        <Chatbot />
        <FeedbackForm />
      </div>
    </div>
  );
}

export default Home;
