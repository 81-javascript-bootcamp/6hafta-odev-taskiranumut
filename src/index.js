import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';
import PomodoroApp from './app.js';

let pomodoroApp = new PomodoroApp({
  tableTbodySelector: '#table-tbody',
  taskFormSelector: '#task-form',
  startBtnSelector: '#start',
  pauseBtnSelector: '#pause',
  timerElSelector: '#timer',
});

pomodoroApp.init();
