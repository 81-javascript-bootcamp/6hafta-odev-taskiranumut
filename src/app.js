import {
  getDataFromApi,
  addTaskToApi,
  deleteFromApi,
  completedTaskOnApi,
} from './data.js';
import { POMODORO_WORK_TIME, POMODORO_BREAK_TIME } from './constants.js';
import { getNow, addMinutes, getRemainingDate } from './helpers/date.js';
import { creatTimer } from './helpers/timer.js';

class PomodoroApp {
  constructor(options) {
    let {
      tableTbodySelector,
      taskFormSelector,
      startBtnSelector,
      timerElSelector,
      pauseBtnSelector,
    } = options;
    this.data = [];
    this.$tableTbody = document.querySelector(tableTbodySelector);
    this.$taskForm = document.querySelector(taskFormSelector);
    this.$taskFormInput = this.$taskForm.querySelector('input');
    this.$startBtn = document.querySelector(startBtnSelector);
    this.$pauseBtn = document.querySelector(pauseBtnSelector);
    this.$timerEl = document.querySelector(timerElSelector);
    this.currentInterval = null;
    this.breakInterval = null;
    this.currentRemaining = null;
    this.currentTask = null;
  }

  fillTasksTable() {
    getDataFromApi().then((currentTasks) => {
      this.data = currentTasks;
      currentTasks.forEach((task, index) => {
        this.addTaskToTable(task, index + 1);
      });
      this.handleDeleteTask();
    });
  }

  addTaskToTable(task, index) {
    const $newTaskEl = document.createElement('tr');
    const $allCloseButtonsArr = document.querySelectorAll('button.close');
    const newIndex = index ? index : $allCloseButtonsArr.length + 1;
    $newTaskEl.innerHTML = `<th class="index" scope="row">${newIndex}</th><td>${task.title}</td>
    <td><button type='button' class="close" id="${task.id}" aria-label="Close">X</button></td>`;
    $newTaskEl.setAttribute('data-taskId', `task${task.id}`);
    if (task.completed) {
      $newTaskEl.classList.add('completed');
    }
    this.$tableTbody.appendChild($newTaskEl);
    this.$taskFormInput.value = '';
  }

  handleDeleteTask() {
    const $closeButtonsDiv = document.getElementById('buttons');
    $closeButtonsDiv.addEventListener('click', (event) => {
      if (event.target.className === 'close') {
        const closeButtonId = event.target.id;
        const $closeButtonEl = document.getElementById(closeButtonId);
        $closeButtonEl.disabled = true;
        deleteFromApi(closeButtonId).then(() => {
          this.removeTask($closeButtonEl);
          $closeButtonEl.disabled = false;
        });
      }
    });
  }

  removeTask(item) {
    const $taskRowEl = item.parentNode.parentNode;
    $taskRowEl.remove();
    this.fixTaskIndex();
  }

  fixTaskIndex() {
    const $thIndexsArr = document.querySelectorAll('th.index');
    $thIndexsArr.forEach((th, index) => {
      th.innerHTML = index + 1;
    });
  }

  handleAddTask() {
    this.$taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.$taskFormInput.value) {
        const task = { title: this.$taskFormInput.value, completed: false };
        this.addTask(task);
      }
    });
  }

  addTask(task) {
    this.addTaskButtonDisabled();
    addTaskToApi(task)
      .then((data) => data.json())
      .then((newTask) => {
        this.addTaskToTable(newTask);
        this.addTaskButtonActivated();
      });
  }

  addTaskButtonDisabled() {
    const $formButton = document.getElementById('form-button');
    $formButton.disabled = true;
    $formButton.innerHTML = `<div class="spinner-border spinner-border-sm text-light" role="status"></div>`;
  }

  addTaskButtonActivated() {
    const $formButton = document.getElementById('form-button');
    $formButton.disabled = false;
    $formButton.innerHTML = 'Add Task';
  }

  handleStart() {
    this.$startBtn.addEventListener('click', () => {
      // check if continue to current task or start a new task.
      if (this.currentRemaining) {
        this.continueTesk();
      } else {
        this.setActiveTask();
      }
    });
  }

  continueTesk() {
    const now = getNow();
    const nowTimestamp = now.getTime();
    const remainingDeadline = new Date(nowTimestamp + this.currentRemaining);
    this.initializeWorkTimer(remainingDeadline);
  }

  setActiveTask() {
    this.handlePreviousTask();
    this.currentTask = this.data.find((task) => !task.completed);
    if (this.currentTask) {
      this.startTask();
    } else {
      this.handleEnd();
    }
  }

  initializeWorkTimer(deadline) {
    creatTimer({
      context: this,
      intervalVariable: 'currentInterval',
      deadline,
      timerElContent: 'Work: ',
      onStop: () => {
        //BURAYA TEKRAR BAK !!
        clearInterval(this.currentInterval);
        const breakDeadline = addMinutes(getNow(), POMODORO_BREAK_TIME);
        this.initializeBreakTimer(breakDeadline);
      },
      currentRemaining: 'currentRemaining',
    });
  }

  initializeBreakTimer(deadline) {
    creatTimer({
      context: this,
      intervalVariable: 'breakInterval',
      deadline: deadline,
      timerElContent: 'Break: ',
      onStop: () => {
        //BURAYA TEKRAR BAK !!
        clearInterval(this.breakInterval);
        completedTaskOnApi(this.currentTask).then(() => {
          this.currentTask.completed = true;
          this.setActiveTask();
        });
      },
      currentRemaining: 'currentRemaining',
    });
  }

  handlePreviousTask() {
    const $currentActiveEl = document.querySelector('tr.active');
    if ($currentActiveEl) {
      $currentActiveEl.classList.remove('active');
      $currentActiveEl.classList.add('completed');
    }
  }

  startTask() {
    const $currentTaskEl = document.querySelector(
      `tr[data-taskId = "task${this.currentTask.id}"]`
    );
    $currentTaskEl.classList.add('active');
    const now = getNow();
    const newDeadline = addMinutes(now, POMODORO_WORK_TIME);
    this.initializeWorkTimer(newDeadline);
  }

  handleEnd() {
    clearInterval(this.currentInterval);
    clearInterval(this.breakInterval);
    this.$timerEl.innerHTML = 'All tasks were done!';
  }

  handlePause() {
    this.$pauseBtn.addEventListener('click', () => {
      clearInterval(this.currentInterval);
    });
  }

  init() {
    this.fillTasksTable();
    this.handleAddTask();
    this.handleStart();
    this.handlePause();
  }
}

export default PomodoroApp;
