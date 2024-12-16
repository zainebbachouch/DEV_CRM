import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import io from "socket.io-client";
import "./addTaskModal.css";

function AddTask({ selectedTask, fetchTasks, tasks, setTasks }) {
  const [loading, setLoading] = useState(false);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [formData, setFormData] = useState({
    idEmploye: '',
    title: '',
    deadline: '',
    priorite: '',
    statut: '',
    messageTache: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');
  const userid = localStorage.getItem('userId');

  const [employees, setEmployees] = useState([]);

  const socket = io.connect("http://localhost:8000");

  const config = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  }), [token]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:4000/api/employees', config);
        setEmployees(response.data);
      } catch (err) {
        console.error('Error fetching employees:', err);
      }
    };

    if (role !== 'employe') {
      fetchEmployees();
    }
  }, [config, role]);

  useEffect(() => {
    if (selectedTask) {
      const parsedContent = JSON.parse(selectedTask.messageTache);
      setEditorState(EditorState.createWithContent(convertFromRaw(parsedContent)));
      setFormData({
        id: selectedTask.id,
        title: selectedTask.title,
        deadline: selectedTask.deadline,
        priorite: selectedTask.priorite,
        statut: selectedTask.statut,
        messageTache: selectedTask.messageTache
      });

      const employeeIds = selectedTask.employe_names.split(',').map(name => {
        const emp = employees.find(emp => `${emp.nom_employe} ${emp.prenom_employe}` === name.trim());
        return emp ? emp.idemploye : null;
      }).filter(id => id);

      setSelectedEmployees(employeeIds);
    } else {
      setFormData({
        id: '',
        title: '',
        deadline: '',
        priorite: '',
        statut: '',
        messageTache: ''
      });
      setEditorState(EditorState.createEmpty());
      setSelectedEmployees([]);
    }
  }, [selectedTask, employees]);

  const handleRemoveEmployee = (idEmploye) => {
    setSelectedEmployees(selectedEmployees.filter((id) => id !== idEmploye));
  };

  const handleEditorChange = (state) => {
    setEditorState(state);
    const rawContentState = convertToRaw(state.getCurrentContent());
    setFormData({ ...formData, messageTache: JSON.stringify(rawContentState) });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectEmployee = (idEmploye) => {
    if (idEmploye && !selectedEmployees.includes(idEmploye)) {
      setSelectedEmployees([...selectedEmployees, idEmploye]);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value) {
      const filtered = employees.filter((employee) =>
        `${employee.nom_employe} ${employee.prenom_employe}`.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const data = {
        idEmployes: selectedEmployees,
        title: formData.title,
        deadline: formData.deadline,
        priorite: formData.priorite,
        statut: formData.statut,
        messageTache: JSON.stringify(convertToRaw(editorState.getCurrentContent()))
      };

      let response;
      if (selectedTask) {
        response = await axios.put(`http://127.0.0.1:4000/api/updateTask/${selectedTask.id}`, data, config);
      } else {
        console.log(data)
      response = await axios.post('http://127.0.0.1:4000/api/createTask', data, config);
        socket.emit('createTask', { ...data, email, userid, role, selectedEmployees });
      }

      if (Array.isArray(response.data)) {
        setTasks(response.data);
      } else {
        setSuccessMessage(response.data.message || 'Task operation successful.');
        setTasks([]);
        setFormData({
          idEmploye: '',
          title: '',
          deadline: '',
          priorite: '',
          statut: '',
          messageTache: ''
        });
        setSelectedEmployees([]);
        document.getElementById("closeButton").click();
        fetchTasks();
      }
    } catch (err) {
      console.error('Error:', err);
      if (err.response) {
        setErrors(err.response.data);
      } else {
        setErrors({ general: 'An error occurred. Please try again later.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal addTaskModal fade h-80 v-80" id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">{selectedTask ? 'Update Task' : 'Add New Task'}</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {errors.general && <div className="alert alert-danger">{errors.general}</div>}
            <form id="taskForm" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title:</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="employees">Employees:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <ul className="list-group mt-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {(searchTerm ? filteredEmployees : employees).map((employee) => (
                    <li key={employee.idemploye} className="list-group-item d-flex justify-content-between align-items-center">
                      {employee.nom_employe} {employee.prenom_employe}
                      <button
                        type="button"
                        className="btn btn-primary btn-sm" id="selectEmployeeBtn"
                        onClick={() => handleSelectEmployee(employee.idemploye)}
                      >
                        Add
                      </button>
                    </li>
                  ))}
                </ul>
                <div>
                  {selectedEmployees.map((idEmploye) => {
                    const employee = employees.find((emp) => emp.idemploye === idEmploye);
                    return (
                      <div key={idEmploye} style={{ marginTop: '5px' }}>
                        {employee ? `${employee.nom_employe} ${employee.prenom_employe}` : 'Employee not found'}
                        <button type="button" className="btn btn-danger btn-sm ml-2" onClick={() => handleRemoveEmployee(idEmploye)}>
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="deadline">Deadline:</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="priorite">Priority:</label>
                <select
                  className="form-control"
                  id="priorite"
                  name="priorite"
                  value={formData.priorite}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Priority</option>
                  <option value="routine">Low</option>
                  <option value="importance">Medium</option>
                  <option value="urgence">High</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="statut">Status:</label>
                <select
                  className="form-control"
                  id="statut"
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Status</option>
                  <option value="To-Do">Pending</option>
                  <option value="In-Progress">In Progress</option>
                  <option value="Done">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="messageTache">Message:</label>
                <Editor
                  editorState={editorState}
                  onEditorStateChange={handleEditorChange}
                  wrapperClassName="editor-wrapper"
                  editorClassName="editor"
                  toolbarClassName="editor-toolbar"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" id="closeButton">Close</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Loading...' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddTask;

