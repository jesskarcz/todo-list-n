import React, { useState, useEffect } from 'react';
import './App.css';
import Cookies from 'js-cookie';

function App() {
  const [tasks, setTasks] = useState(() => {
    const storedTasks = Cookies.get('tasks');
    return storedTasks ? JSON.parse(storedTasks) : [];
  });
  const [deletedTasks, setDeletedTasks] = useState(() => {
    const storedDeletedTasks = Cookies.get('deletedTasks');
    return storedDeletedTasks ? JSON.parse(storedDeletedTasks) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [cookiesAccepted, setCookiesAccepted] = useState(Cookies.get('cookiesAccepted'));

  const addTask = () => {
    if (inputValue.trim() !== '') {
      const newTask = {
        id: Date.now(),
        text: inputValue,
        completed: false,
        dateAdded: new Date().toLocaleString(), // Include date and time
        lastUpdated: null, // Initialize lastUpdated as null
        edit: false // Add edit state
      };
      setTasks([...tasks, newTask]);
      setInputValue('');
    }
  }; 

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const deleteTask = id => {
    const taskToDelete = tasks.find(task => task.id === id);
    if (taskToDelete) {
      setDeletedTasks([...deletedTasks, { ...taskToDelete, deletedDate: new Date().toLocaleString() }]);
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  const restoreTask = id => {
    const taskToRestore = deletedTasks.find(task => task.id === id);
    if (taskToRestore) {
      setTasks([...tasks, taskToRestore]);
      setDeletedTasks(deletedTasks.filter(task => task.id !== id));
    }
  };
  const deleteForever = id => {
    setDeletedTasks(deletedTasks.filter(task => task.id !== id));
  };
  

  const toggleEdit = id => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, edit: !task.edit } : task
      )
    );
  };

  const confirmEdit = (id, newText) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, text: newText, lastUpdated: new Date().toLocaleString(), edit: false } : task
      )
    );
  };

  const toggleComplete = id => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed, lastUpdated: new Date().toLocaleString() } : task
      )
    );
  };

  const completedTasks = tasks.filter(task => task.completed);
  const incompleteTasks = tasks.filter(task => !task.completed);

  const acceptCookies = () => {
    setCookiesAccepted(true);
    Cookies.set('cookiesAccepted', true, { expires: 365 });
  };

  useEffect(() => {
    Cookies.set('tasks', JSON.stringify(tasks), { expires: 7 });
  }, [tasks]);

  useEffect(() => {
    Cookies.set('deletedTasks', JSON.stringify(deletedTasks), { expires: 7 });
  }, [deletedTasks]);

  const downloadTasks = () => {
    const formattedTasks = tasks.map(task => {
      let formattedTask = `- ${task.text} (Created: ${task.dateAdded})`;
      if (task.completed) {
        formattedTask += ` - Completed: ${new Date().toLocaleString()}`;
      }
      return formattedTask;
    });
    const tasksData = formattedTasks.join('\n');
    const fileName = `todo-list_${new Date().toLocaleDateString().replace(/\//g, '-')}.txt`;
    const blob = new Blob([tasksData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  

  const shareTasks = async () => {
    const formattedTasks = tasks.map(task => `- ${task.text} (Created: ${task.dateAdded})`).join('\n');
    const tasksData = new Blob([formattedTasks], { type: 'text/plain' });
    const fileName = `todo-list_${new Date().toLocaleDateString().replace(/\//g, '-')}.txt`;
    const file = new File([tasksData], fileName, { type: 'text/plain' });
  
    try {
      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'Share Tasks',
          text: 'Share tasks file',
        });
      } else {
        throw new Error('Share API not supported');
      }
    } catch (error) {
      console.error('Error sharing tasks:', error);
    }
  };
  

  return (
    <div className="App">
      {!cookiesAccepted && (
        <div className="cookies-disclaimer">
          <p>We use cookies to save the list in your browser locally, and enhance your experience on this site.</p>
          <button onClick={acceptCookies}>Accept Cookies</button>
        </div>
      )}
      <h1>TO-DO LIST 🗒️</h1>
      <input
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Add a new task"
      />
      <button className="itemBtn" onClick={addTask}>Add Task</button>
      <button className="itemBtn" onClick={downloadTasks}>Download List</button>
      <button className="itemBtn" onClick={shareTasks}>Share List</button>
      <h2>Tasks</h2>
      <ul>
        {incompleteTasks.map(task => (
          <li key={task.id} className={task.completed ? 'completed' : ''}>
            {task.edit ? (
              <input
              type="text"
              defaultValue={task.text}
              onBlur={(e) => {
                if (e.target.value.trim() !== '') {
                  confirmEdit(task.id, e.target.value);
                }
              }}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.target.blur();
                }
              }}
            />
            
            ) : (
              <>
                <span>{task.text}</span>
                <div>
                  <span className="small-text">Added on: {task.dateAdded}</span> {' '}
                  {task.lastUpdated && <span className="small-text">Last Updated: {task.lastUpdated}</span>}
                  <div>
                    <button className="itemBtn editItem" onClick={() => toggleEdit(task.id)}>Edit</button>
                    <button className="itemBtn" onClick={() => deleteTask(task.id)}>Delete</button>
                    <button className="itemBtn itemCompleted" onClick={() => toggleComplete(task.id)}>
                      {task.completed ? 'Undo' : 'Complete'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      <h2>Completed Tasks</h2>
      <ul>
        {completedTasks.map(task => (
          <li key={task.id} className={task.completed ? 'completed' : ''}>
            <span>{task.text}</span>
            <div>
              <span className="small-text">Added on: {task.dateAdded}</span> {' '} {/* Add a space here */}
              {task.completed && <span className="small-text">Completed on: {task.lastUpdated}</span>} {/* Add this line */}
              <div>
                <button onClick={() => deleteTask(task.id)}>Delete</button>
                <button onClick={() => toggleComplete(task.id)}>
                  {task.completed ? 'Undo' : 'Complete'}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <h2>Deleted Tasks</h2>
      <ul>
        {deletedTasks.map(task => (
          <li key={task.id} className="deleted-task">
            <span>{task.text}</span>
            <div>
              <span className="small-text">Deleted on: {task.deletedDate}</span>
              <button onClick={() => restoreTask(task.id)}>Restore</button>
              <button onClick={() => deleteForever(task.id)}>Delete Forever</button> {/* Add this button */}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;