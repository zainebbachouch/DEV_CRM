import React, { useState, useEffect } from "react";
import "../../style/viewsStyle/calendar.css"; // Import the CSS file for styling
import { FaArrowCircleLeft } from "react-icons/fa";
import { FaArrowCircleRight } from "react-icons/fa";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState([]);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const renderCalendar = (date) => {
    const currYear = date.getFullYear();
    const currMonth = date.getMonth();
    const firstDayofMonth = new Date(currYear, currMonth, 1).getDay();
    const lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate();
    const lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay();
    const lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate();

    let liTag = "";

    // Previous month days
    for (let i = firstDayofMonth; i > 0; i--) {
      liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
    }

    // Current month days
    for (let i = 1; i <= lastDateofMonth; i++) {
      const isToday = i === date.getDate() && currMonth === new Date().getMonth() && currYear === new Date().getFullYear() ? "active" : "";
      liTag += `<li class="${isToday}">${i}</li>`;
    }

    // Next month days
    for (let i = lastDayofMonth; i < 6; i++) {
      liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`;
    }

    setDays(liTag);
  };

  useEffect(() => {
    renderCalendar(currentDate);
  }, [currentDate]);

  const handlePrevNext = (direction) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  return (
    <div className="wrapper">
      <header>
        <p className="current-date">{`${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`}</p>
        <div className="icons  d-flex align-items-baseline justify-content-center">
          <p id="prev" className="material-symbols-rounded material" onClick={() => handlePrevNext(-1)}><FaArrowCircleLeft />
          </p>
          <p className="currentDateText">{(currentDate.getDate()<10?"0"+currentDate.getDate():currentDate.getDate()) +" "+ months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </p>
          <p id="next" className="material-symbols-rounded material" onClick={() => handlePrevNext(1)}><FaArrowCircleRight />
          </p>
        </div>
      </header>
      <div className="calendar">
        <ul className="weeks">
          <li>Sun</li>
          <li>Mon</li>
          <li>Tue</li>
          <li>Wed</li>
          <li>Thu</li>
          <li>Fri</li>
          <li>Sat</li>
        </ul>
        <ul className="days" dangerouslySetInnerHTML={{ __html: days }} />
      </div>
    </div>
  );
};

export default Calendar;
