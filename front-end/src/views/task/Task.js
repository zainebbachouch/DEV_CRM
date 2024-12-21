import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import { HiMenuAlt2 } from "react-icons/hi";

import { FaPlus } from "react-icons/fa6";
import { LuClock7 } from "react-icons/lu";
import SideBar from '../../components/sidebar/SideBar';
import TopBar from '../../components/sidenav/TopNav';
import { format } from 'date-fns';
import orderBy from 'lodash/orderBy';
import AddTask from './AddTask';
import { CiMenuKebab } from "react-icons/ci";
import '../../style/viewsStyle/task.css';
import { RiDeleteBinLine } from "react-icons/ri";
import { FaDoorOpen } from "react-icons/fa6";
import io from "socket.io-client";



function Task() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const email = localStorage.getItem('email');
  const userid = localStorage.getItem('userId');

  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isOpen, setIsOpen] = useState({});

  const socket = io.connect("http://localhost:8000");


  const config = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }), [token]);

  const fetchTasks = useCallback(async () => {
    const tasksByStatus = {
      "To-Do": [],
      "In-Progress": [],
      "Done": []
    };

    try {
      const response = await axios.get('http://localhost:4000/api/getAllTasks', config);
      console.log(response.data);

      // Create a Set to track unique task IDs
      const uniqueTaskIds = new Set();

      response.data.forEach(task => {
        const statusKey = task.statut.trim();

        // Skip the task if its ID is already in the Set
        if (uniqueTaskIds.has(task.id)) return;

        // Add the task ID to the Set
        uniqueTaskIds.add(task.id);

        // Initialize the array for the status if it doesn't exist
        if (!tasksByStatus[statusKey]) {
          tasksByStatus[statusKey] = [];
        }

        // Add the task to the appropriate status array
        tasksByStatus[statusKey].push(task);

        // Initialize isOpen state for each task
        setIsOpen(prevState => ({
          ...prevState,
          [task.id]: false
        }));
      });

      console.log('Fetched tasks:', tasksByStatus);
      setTasks(tasksByStatus);

    } catch (error) {
      console.error('Error fetching all tasks:', error);
    }
  }, [config]);


  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);


  const handleOnDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // If there's no destination, do nothing
    if (!destination) return;

    console.log('Drag result:', result);

    try {
      // Deep clone the tasks to avoid direct state mutation
      const updatedTasks = JSON.parse(JSON.stringify(tasks));
      console.log('Initial cloned tasks:', updatedTasks);

      const sourceList = updatedTasks[source.droppableId];
      const destinationList = updatedTasks[destination.droppableId];

      // Remove the task from the source list
      const [movedTask] = sourceList.splice(source.index, 1);
      console.log('Moved task:', movedTask);

      // Update the task's status if it was moved to a different column
      if (source.droppableId !== destination.droppableId) {
        movedTask.statut = destination.droppableId;
      }



      // Insert the task into the destination list at the specified index
      destinationList.splice(destination.index, 0, movedTask);
      console.log('Updated destination list:', destinationList);

      // Update the order of tasks in the source list
      sourceList.forEach((task, index) => {
        task.order = index;
      });
      console.log('Updated source list:', sourceList);

      // Update the order of tasks in the destination list
      destinationList.forEach((task, index) => {
        task.order = index;
      });

      console.log('Updated tasks:', updatedTasks);
      // Set the updated tasks in state
      setTasks(updatedTasks);

      // Prepare data for PUT request for single task
      const formattedDeadline = format(new Date(movedTask.deadline), 'yyyy-MM-dd HH:mm:ss');
      const putData = {
        messageTache: movedTask.messageTache,
        deadline: formattedDeadline,
        statut: movedTask.statut,
        priorite: movedTask.priorite,
        order: movedTask.order,
        email,
        userid,
        role,
        token,
        taskId: draggableId // Include the taskId here
        // Include the token here
      };

      await axios.put(`http://127.0.0.1:4000/api/updateTaskStatus/${draggableId}`, putData, config);

      if (movedTask.statut === "Done") {
        socket.emit('TaskifDone', putData);
      }
      // Prepare data for updating order of all tasks
      const updateOrderData = [
        ...sourceList.map((task) => ({ id: task.id, order: task.order })),
        ...destinationList.map((task) => ({ id: task.id, order: task.order }))
      ];

      console.log('PUT data for order update:', updateOrderData);
      // Update the order of all tasks in the affected columns
      await axios.put(
        `http://127.0.0.1:4000/api/updateTasksOrder`,
        { tasks: updateOrderData },
        config
      );

      console.log('Task status and order updated successfully');

    } catch (error) {
      console.error('Error updating task status and order:', error);
      fetchTasks(); // Re-fetch tasks to revert to the previous state on error
    }
  };



  const parseMessageTache = (messageTache) => {
    try {
      const parsedData = JSON.parse(messageTache);
      return parsedData.blocks.map(block => block.text).join(' ');
    } catch (error) {
      console.error('Invalid JSON in messageTache:', error);
      return '';
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString.slice(0, 10);
  };

  const toggleDropdown = (taskId) => {
    setIsOpen(prevState => ({
      ...prevState,
      [taskId]: !prevState[taskId]
    }));

  };


  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`http://127.0.0.1:4000/api/deleteTask/${taskId}`, config);
      console.log('Task deleted successfully');
      fetchTasks(); // Re-fetch tasks after deletion
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };


  const handleUpdate = (task, action) => {
    if (action === "update") {
      setSelectedTask(task);
    }
  };


  return (
    <div className="d-flex">
      <SideBar />
      <div className="container-fluid flex-column ">
        <TopBar />
        {/* Button to open add task modal */}
        {/* <button className="btn btn-success mr-2  w-100" id="addButtonTask" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={() => handleUpdate('val', 'ajouter')}>
          Add Task
        </button> */}

        {/* AddTask modal */}
        <AddTask
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
          fetchTasks={fetchTasks}
          tasks={tasks}
          setTasks={setTasks}
        />
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <div className="columns-container tasksContainer  d-flex flex-wrap align-items-start">
            {Object.keys(tasks).map((status) => (
              <Droppable key={status} droppableId={status}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="column "
                  >
                    <div className='d-flex  taskTitleCtr'>
                      <div className='d-flex column-gap-2'>{status.replace('-', ' ')} <p id="tkCountContainer">{(tasks[status].length)}</p></div>
                      <div><button className="mr-2  plusAddBtn" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={() => handleUpdate('val', 'ajouter')}><FaPlus /></button></div>
                    </div>
                    {orderBy(tasks[status], ['order'], ['asc']).map((task, taskIndex) => (
                      <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={taskIndex}>
                        {(provided) => (

                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="task-item"
                          >
                            <div className="taskHeader ">
                              <div className=" editTaskDropdown dropdown">
                                <div className="icon1 CiMenuKebab" onClick={() => toggleDropdown(task.id)}>
                                  <CiMenuKebab />
                                </div>
                                {isOpen[task.id] && (
                                  <div className="btnMenuEditor ">
                                    <div className="dropdown-item   edtTsk" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={() => handleUpdate(task, 'update')}>
                                      <FaDoorOpen className='actionText ' /> Edit
                                    </div>
                                    <div className="dropdown-item btn-danger dltTsk" onClick={() => handleDelete(task.id)}>
                                      <RiDeleteBinLine className='actionText ' /> Delete
                                    </div>
                                  </div>
                                )}
                              </div>
                              <p className='h5'>{task.title}</p>
                            </div>
                            <div className="taskBody p-1">
                              <div className="taskDetail">
                                <HiMenuAlt2 className='mx-1 menuIconCt' />
                                <LuClock7 className='mx-1 menuIconCt' />
                                <span>{
                                  new Date(task.deadline)
                                    .toLocaleDateString('en-GB', { year: 'numeric', month: 'short' })
                                    .replace('Jul', 'jul') // Convert to lowercase
                                    .replace('Aug', 'aug') // Convert to lowercase
                                    .replace('Sep', 'sep')
                                  // Convert to lowercase

                                }</span>
                              </div>
                              <img src={task.photo_employe} className='photoEmployeTask' alt="" />
                            </div>

                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}

export default Task;
