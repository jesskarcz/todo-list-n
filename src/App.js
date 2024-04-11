import React, { useState, useEffect } from 'react';
import './App.css';
import Cookies from 'js-cookie';
import { Tab } from '@headlessui/react';

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

  const acceptCookies = () => {
    setCookiesAccepted(true);
    Cookies.set('cookiesAccepted', true, { expires: 365 });
  };

  const addTask = () => {
    if (inputValue.trim() !== '') {
      const newTask = {
        id: Date.now(),
        text: inputValue,
        completed: false,
        dateAdded: new Date().toLocaleString(),
        lastUpdated: null,
        edit: false
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

 
  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  const toggleComplete = id => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed, lastUpdated: new Date().toLocaleString() } : task
      )
    );
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


  const completedTasks = tasks.filter(task => task.completed);
  const incompleteTasks = tasks.filter(task => !task.completed);

  useEffect(() => {
    Cookies.set('tasks', JSON.stringify(tasks), { expires: 7 });
    Cookies.set('deletedTasks', JSON.stringify(deletedTasks), { expires: 7 });
  }, [tasks, deletedTasks]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {!cookiesAccepted && (
        <div className="cookies-disclaimer bg-black text-white p-4 rounded-lg shadow">
          <p>We use cookies to save the list in your browser locally, and enhance your experience on this site.</p>
          <button className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={acceptCookies}>Accept Cookies</button>
        </div>
      )}
      <h1 className="text-4xl text-black-500 my-4">TO-DO LIST 🗒️</h1>
        
      <div className="flex items-center">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a new task"
          className="rounded-lg border-2 p-2"
        />
        <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded ml-2" onClick={addTask}>Add Task</button> 
      </div>
      <div className="my-4">
        <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded" onClick={downloadTasks}>Download List</button> 
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded ml-2" onClick={shareTasks}>Share List</button>
      </div>

      <Tab.Group>
        <Tab.List className="flex p-1 space-x-2 my-8 bg-blue-900/20 rounded-xl">
          <Tab className={({ selected }) => classNames(
              'w-full py-[calc(theme(spacing.2)-1px)] px-[calc(theme(spacing.3)-1px)] text-sm leading-5 font-medium rounded-lg',
              'cursor-pointer border border-gray-300 text-gray-700 outline-2 outline-offset-2 transition-all duration-300',
              'hover:border-gray-400',
              selected ? 'bg-white text-gray-700 shadow-lg transform scale-105' : 'hover:bg-white/[0.12] hover:text-white'
          )}>
              In&nbsp;Progress
          </Tab>
          <Tab className={({ selected }) => classNames(
              'w-full py-[calc(theme(spacing.2)-1px)] px-[calc(theme(spacing.3)-1px)] text-sm leading-5 font-medium rounded-lg',
              'cursor-pointer border border-gray-300 text-gray-700 outline-2 outline-offset-2 transition-all duration-300',
              '-ml-px',  // For adjacent tab overlap
              'hover:border-gray-400',
              selected ? 'bg-white text-gray-700 shadow-lg transform scale-105' : 'hover:bg-white/[0.12] hover:text-white'
          )}>
              Completed
          </Tab>
          <Tab className={({ selected }) => classNames(
              'w-full py-[calc(theme(spacing.2)-1px)] px-[calc(theme(spacing.3)-1px)] text-sm leading-5 font-medium rounded-lg',
              'cursor-pointer border border-gray-300 text-gray-700 outline-2 outline-offset-2 transition-all duration-300',
              '-ml-px',  // For adjacent tab overlap
              'hover:border-gray-400',
              selected ? 'bg-white text-gray-700 shadow-lg transform scale-105' : 'hover:bg-white/[0.12] hover:text-white'
          )}>
              Deleted
          </Tab>
      </Tab.List>
 
        <Tab.Panels>
          <Tab.Panel className="overflow-hidden rounded-3xl p-6 shadow-lg shadow-gray-900/5 bg-white">
              <ul className="divide-y divide-gray-200 text-gray-700">
                  {incompleteTasks.map(task => (
                      <li key={task.id} className={`py-2 deleted-task flex flex-col max-w-xl ${task.completed ? 'completed' : ''}`}>
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
                                  className="rounded-lg border border-gray-300 p-2 text-gray-700 focus:ring-2 focus:ring-cyan-500"
                              />
                          ) : (
                              <>
                                  <span className="my-3 text-center">{task.text}</span>
                                  <div>
                                      <button className="mx-1 rounded-lg bg-gray-800 text-white hover:bg-pink-700 p-2" onClick={() => toggleEdit(task.id)}>Edit</button>
                                      <button className="mx-1 rounded-lg bg-gray-800 text-white hover:bg-orange-700 p-2" onClick={() => deleteTask(task.id)}>Delete</button>
                                      <button className="mx-1 rounded-lg bg-gray-800 text-white hover:bg-green-700 p-2" onClick={() => toggleComplete(task.id)}>
                                          {task.completed ? 'Undo' : 'Complete'}
                                      </button>
                                   </div>
                                   <span className="small-text mt-2.5">Added on: {task.dateAdded}</span>{' '}
                                      {task.lastUpdated && <span className="small-text mb-2.5">Last Updated: {task.lastUpdated}</span>}
                              </>
                          )}
                      </li>
                  ))}
              </ul>
          </Tab.Panel>
          <Tab.Panel className="overflow-hidden rounded-3xl p-6 shadow-lg shadow-gray-900/5 bg-white">
              <ul className="divide-y divide-gray-200 text-gray-700">
                  {completedTasks.map(task => (
                      <li key={task.id} className={`py-2 deleted-task flex flex-col max-w-xl ${task.completed ? 'completed' : ''}`}>
                          <span className="my-3 text-center">{task.text}</span>
                              <div>
                                  <button className="mx-1 rounded-lg bg-gray-800 text-white hover:bg-red-600 p-2" onClick={() => deleteTask(task.id)}>Delete</button>
                                  <button className="mx-1 rounded-lg bg-gray-800 text-white hover:bg-cyan-600 p-2" onClick={() => toggleComplete(task.id)}>
                                  {task.completed ? 'Undo' : 'Complete'}
                                  </button>
                              </div>
                              <span className="small-text mt-2.5">Added on: {task.dateAdded}</span>
                              {task.completed && <span className="small-text mb-2.5">Completed on: {task.lastUpdated}</span>}
                          
                      </li>
                  ))}
              </ul>
          </Tab.Panel>
          <Tab.Panel className="overflow-hidden rounded-3xl p-6 shadow-lg shadow-gray-900/5 bg-gray-900">
              <ul className="divide-y divide-gray-800 text-gray-300">
                  {deletedTasks.map(task => (
                      <li key={task.id} className="py-2 deleted-task flex flex-col max-w-xl">
                           <span className="my-3 text-center">{task.text}</span>
                          <div>
                              <button className="mx-1 rounded-lg bg-gray-800 text-white hover:bg-cyan-600 p-2" onClick={() => restoreTask(task.id)}>Restore</button>
                              <button className="mx-1 rounded-lg bg-gray-800 text-white hover:bg-red-600 p-2" onClick={() => deleteForever(task.id)}>Delete Forever</button>
                          </div>
                          <span className="small-text my-2.5">Deleted on: {task.deletedDate}</span>
                      </li>
                  ))}
              </ul>
          </Tab.Panel>
      </Tab.Panels>

      </Tab.Group>

      <footer className="w-full text-sm text-center py-2">
        <p className="text-black-500">TODO LIST - Built by JK - {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;
