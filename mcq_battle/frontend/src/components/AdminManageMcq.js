import React, { useState, useEffect } from 'react';
import '../assets/styles/AdminManageMcq.css';

const AdminManageMCQs = () => {
  const [mcqs, setMcqs] = useState([]);
  const [newMcq, setNewMcq] = useState({
    question: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    difficulty: 'medium'
  });
  const [editingMcqId, setEditingMcqId] = useState(null);
  const [showMcqs, setShowMcqs] = useState(false);

  useEffect(() => {
    const fetchMcqs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/mcqs', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setMcqs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching MCQs:', error);
        setMcqs([]);
      }
    };
    fetchMcqs();
  }, []);

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    if (name.startsWith('option')) {
      const newOptions = [...newMcq.options];
      newOptions[index] = value;
      setNewMcq({ ...newMcq, options: newOptions });
    } else {
      setNewMcq({ ...newMcq, [name]: value });
    }
  };

  const handleCorrectOptionChange = (e) => {
    setNewMcq({ ...newMcq, correctOptionIndex: parseInt(e.target.value) });
  };

  const handleAddOrEditMcq = async () => {
    const token = localStorage.getItem('token');
    const url = editingMcqId
      ? `http://localhost:5000/api/mcqs/${editingMcqId}`
      : 'http://localhost:5000/api/mcqs/add';
    const method = editingMcqId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMcq)
      });
      const data = await response.json();

      if (editingMcqId) {
        setMcqs(mcqs.map(mcq => (mcq._id === editingMcqId ? data : mcq)));
      } else {
        setMcqs([...mcqs, data]);
      }

      setNewMcq({
        question: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        difficulty: 'medium'
      });
      setEditingMcqId(null);
    } catch (error) {
      console.error(`Error ${editingMcqId ? 'editing' : 'adding'} MCQ:`, error);
    }
  };

  const handleEditMcq = (mcq) => {
    setNewMcq({
      question: mcq.question,
      options: mcq.options,
      correctOptionIndex: mcq.correctOptionIndex,
      difficulty: mcq.difficulty
    });
    setEditingMcqId(mcq._id);
  };

  const handleDeleteMcq = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/mcqs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setMcqs(mcqs.filter((mcq) => mcq._id !== id));
    } catch (error) {
      console.error('Error deleting MCQ:', error);
    }
  };

  return (
    <div className='bg'>
      <div className="admin-manage-mcqs">
       
        <div className="content">
          <div className="mcq-form">
            <h2>{editingMcqId ? 'Edit MCQ' : 'Add New MCQ'}</h2>
            <input
              type="text"
              name="question"
              placeholder="Enter question here"
              value={newMcq.question}
              onChange={handleInputChange}
            />
            <div>
              {newMcq.options.map((option, index) => (
                <input
                  key={index}
                  type="text"
                  name={`option${index}`}
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleInputChange(e, index)}
                />
              ))}
            </div>
            <select
              name="correctOptionIndex"
              value={newMcq.correctOptionIndex}
              onChange={handleCorrectOptionChange}
            ><option value="Select Correct Option">Select Correct Option</option>
              {newMcq.options.map((_, index) => (
                
                <option key={index} value={index}>
                  {`Option ${index + 1}`}
                </option>
              ))}
            </select>
            <select
              name="difficulty"
              value={newMcq.difficulty}
              onChange={handleInputChange}
            >
              <option value="Select Difficulty">Select Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <button onClick={handleAddOrEditMcq} className="add-mcq-btn">
              {editingMcqId ? 'Save Changes' : 'Add MCQ'}
            </button>
          </div>
          <div className="mcqs-list">
            <button className="show-mcqs-btn" onClick={() => setShowMcqs(!showMcqs)}>
              {showMcqs ? 'Hide All MCQs' : 'Show All MCQs'}
            </button>
            {showMcqs && (
              <div className="all-mcqs">
                <h2>All MCQs</h2>
                <ul>
                  {Array.isArray(mcqs) && mcqs.map((mcq) => (
                    <li key={mcq._id}>
                      <span>{mcq.question}</span>
                      <div className="mcq-buttons">
                        <button className="edit-btn" onClick={() => handleEditMcq(mcq)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDeleteMcq(mcq._id)}>Delete</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManageMCQs;
