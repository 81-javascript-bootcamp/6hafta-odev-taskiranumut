import { API_URL } from './constants.js';

export const getDataFromApi = () => {
  return fetch(API_URL)
    .then((data) => data.json())
    .then((data) => data);
};

export const addTaskToApi = (task) => {
  return fetch(API_URL, {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });
};

export const deleteFromApi = (taskId) => {
  return fetch(`${API_URL}/${taskId}`, {
    method: 'delete',
  });
};

export const completedTaskOnApi = (task) => {
  return fetch(`${API_URL}/${task.id}`, {
    method: 'put',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...task, completed: true }),
  });
};
