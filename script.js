/**
 * ==========================================================================
 * PERSONAL YEARLY TRACKER (OCTOBER 2026 — OCTOBER 2027)
 * Pure Vanilla JavaScript Application Logic
 * No frameworks, No libraries, No backend.
 * ==========================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. CONFIGURATION & CONSTANTS
  // --------------------------------------------------------------------------
  const STORAGE_KEY = 'personal_yearly_tracker_2026_2027';

  // Strict 13-Month Range: October 1, 2026 to October 31, 2027
  const MONTHS_CONFIG = [
    { year: 2026, month: 9, name: 'October 2026' },      // 0: Oct 2026
    { year: 2026, month: 10, name: 'November 2026' },    // 1: Nov 2026
    { year: 2026, month: 11, name: 'December 2026' },    // 2: Dec 2026
    { year: 2027, month: 0, name: 'January 2027' },      // 3: Jan 2027
    { year: 2027, month: 1, name: 'February 2027' },     // 4: Feb 2027
    { year: 2027, month: 2, name: 'March 2027' },        // 5: Mar 2027
    { year: 2027, month: 3, name: 'April 2027' },        // 6: Apr 2027
    { year: 2027, month: 4, name: 'May 2027' },          // 7: May 2027
    { year: 2027, month: 5, name: 'June 2027' },         // 8: Jun 2027
    { year: 2027, month: 6, name: 'July 2027' },         // 9: Jul 2027
    { year: 2027, month: 7, name: 'August 2027' },       // 10: Aug 2027
    { year: 2027, month: 8, name: 'September 2027' },    // 11: Sep 2027
    { year: 2027, month: 9, name: 'October 2027' }       // 12: Oct 2027
  ];

  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Total days strictly calculated across all 13 months
  const TOTAL_TRACKER_DAYS = MONTHS_CONFIG.reduce((acc, m) => {
    return acc + new Date(m.year, m.month + 1, 0).getDate();
  }, 0); // 396 days

  // --------------------------------------------------------------------------
  // 2. APPLICATION STATE
  // --------------------------------------------------------------------------
  let currentMonthIndex = 0; // Default to October 2026
  let currentFilter = 'all';  // 'all' | 'completed' | 'incomplete'
  let trackerData = {};      // Keyed by 'YYYY-MM-DD'

  // Modal active targets
  let activeModalTarget = {
    dateStr: null,
    taskId: null
  };

  // --------------------------------------------------------------------------
  // 3. INITIAL SEED DEMO DATA
  // --------------------------------------------------------------------------
  const DEMO_DATA = {
    '2026-10-01': {
      tasks: [
        { id: 'demo_t1', title: 'Study Python', completed: true },
        { id: 'demo_t2', title: 'JARVIS Project', completed: false },
        { id: 'demo_t3', title: 'Exercise', completed: false }
      ],
      notes: 'Kicked off the yearly tracker! Focused on Python fundamentals.'
    },
    '2026-10-02': {
      tasks: [
        { id: 'demo_t4', title: 'JARVIS Architecture Wireframes', completed: true },
        { id: 'demo_t5', title: 'Daily Workout', completed: true }
      ],
      notes: 'Super productive Friday!'
    },
    '2026-10-03': {
      tasks: [
        { id: 'demo_t6', title: 'Review System Specs', completed: false },
        { id: 'demo_t7', title: 'Read 20 pages', completed: false }
      ],
      notes: ''
    }
  };

  // --------------------------------------------------------------------------
  // 4. DOM ELEMENTS
  // --------------------------------------------------------------------------
  const DOM = {
    // Header & Stats
    statTotalDays: document.getElementById('statTotalDays'),
    statCompletedDays: document.getElementById('statCompletedDays'),
    statTotalTasks: document.getElementById('statTotalTasks'),
    statProgressPercent: document.getElementById('statProgressPercent'),
    overallProgressBarFill: document.getElementById('overallProgressBarFill'),
    overallProgressBarTrack: document.getElementById('overallProgressBarTrack'),

    // Month Navigation
    btnPrevMonth: document.getElementById('btnPrevMonth'),
    btnNextMonth: document.getElementById('btnNextMonth'),
    currentMonthLabel: document.getElementById('currentMonthLabel'),
    currentMonthMeta: document.getElementById('currentMonthMeta'),
    btnJumpToday: document.getElementById('btnJumpToday'),

    // Filters
    filterTabs: document.querySelectorAll('.filter-tab'),
    countAll: document.getElementById('countAll'),
    countCompleted: document.getElementById('countCompleted'),
    countIncomplete: document.getElementById('countIncomplete'),

    // Day Grid
    daysGrid: document.getElementById('daysGrid'),

    // Modals
    addTaskModal: document.getElementById('addTaskModal'),
    addTaskForm: document.getElementById('addTaskForm'),
    addTaskInput: document.getElementById('addTaskInput'),
    addTaskTargetDateDisplay: document.getElementById('addTaskTargetDateDisplay'),

    editTaskModal: document.getElementById('editTaskModal'),
    editTaskForm: document.getElementById('editTaskForm'),
    editTaskInput: document.getElementById('editTaskInput'),
    editTaskTargetDateDisplay: document.getElementById('editTaskTargetDateDisplay'),

    deleteTaskModal: document.getElementById('deleteTaskModal'),
    deleteTaskNamePreview: document.getElementById('deleteTaskNamePreview'),
    btnConfirmDeleteTask: document.getElementById('btnConfirmDeleteTask'),

    yearOverviewModal: document.getElementById('yearOverviewModal'),
    yearOverviewGrid: document.getElementById('yearOverviewGrid'),
    btnYearOverview: document.getElementById('btnYearOverview'),

    searchModal: document.getElementById('searchModal'),
    btnSearch: document.getElementById('btnSearch'),
    globalSearchInput: document.getElementById('globalSearchInput'),
    searchResultsList: document.getElementById('searchResultsList'),
    searchMatchCount: document.getElementById('searchMatchCount'),
    btnClearSearch: document.getElementById('btnClearSearch'),

    settingsModal: document.getElementById('settingsModal'),
    btnSettings: document.getElementById('btnSettings'),
    btnExportData: document.getElementById('btnExportData'),
    importFileInput: document.getElementById('importFileInput'),
    btnLoadDemoData: document.getElementById('btnLoadDemoData'),
    btnOpenClearConfirm: document.getElementById('btnOpenClearConfirm'),

    clearConfirmModal: document.getElementById('clearConfirmModal'),
    btnConfirmClearAll: document.getElementById('btnConfirmClearAll'),

    toastContainer: document.getElementById('toastContainer')
  };

  // --------------------------------------------------------------------------
  // 5. STORAGE & DATA MANAGEMENT
  // --------------------------------------------------------------------------
  function loadDataFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        trackerData = JSON.parse(stored);
      } else {
        // First run: load initial sample demo data so user immediately sees how it works
        trackerData = JSON.parse(JSON.stringify(DEMO_DATA));
        saveDataToStorage();
      }
    } catch (e) {
      console.error('Error loading data from localStorage:', e);
      trackerData = JSON.parse(JSON.stringify(DEMO_DATA));
    }
  }

  function saveDataToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trackerData));
    } catch (e) {
      console.error('Error saving data to localStorage:', e);
      showToast('Error saving data to local storage', 'danger');
    }
  }

  function ensureDateEntry(dateStr) {
    if (!trackerData[dateStr]) {
      trackerData[dateStr] = { tasks: [], notes: '' };
    }
    if (!Array.isArray(trackerData[dateStr].tasks)) {
      trackerData[dateStr].tasks = [];
    }
    if (typeof trackerData[dateStr].notes !== 'string') {
      trackerData[dateStr].notes = '';
    }
    return trackerData[dateStr];
  }

  // --------------------------------------------------------------------------
  // 6. HELPER DATE UTILITIES
  // --------------------------------------------------------------------------
  function formatDateISO(year, month, day) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  }

  function formatHumanDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const weekday = WEEKDAYS[dateObj.getDay()];
    const monthName = MONTH_NAMES[m - 1];
    return `${monthName} ${d}, ${y} (${weekday})`;
  }

  function getTodayISO() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function isWithinTrackerPeriod(dateStr) {
    return dateStr >= '2026-10-01' && dateStr <= '2027-10-31';
  }

  function findMonthIndexForDate(dateStr) {
    const [y, m] = dateStr.split('-').map(Number);
    return MONTHS_CONFIG.findIndex(mc => mc.year === y && mc.month === (m - 1));
  }

  // --------------------------------------------------------------------------
  // 7. DAY STATUS & METRICS
  // --------------------------------------------------------------------------
  /**
   * Day status:
   * - 'empty': 0 tasks
   * - 'completed': all tasks completed (>= 1 task)
   * - 'in-progress': some tasks completed, some not, or tasks exist but none completed yet
   */
  function getDayStatus(dateStr) {
    const dayEntry = trackerData[dateStr];
    if (!dayEntry || !dayEntry.tasks || dayEntry.tasks.length === 0) {
      return { status: 'empty', label: 'No tasks', completedCount: 0, totalCount: 0 };
    }
    const total = dayEntry.tasks.length;
    const completed = dayEntry.tasks.filter(t => t.completed).length;

    if (completed === total) {
      return { status: 'completed', label: 'Completed', completedCount: completed, totalCount: total };
    }
    return {
      status: 'in-progress',
      label: `In Progress (${completed}/${total})`,
      completedCount: completed,
      totalCount: total
    };
  }

  // --------------------------------------------------------------------------
  // 8. RENDER OVERALL STATISTICS
  // --------------------------------------------------------------------------
  function updateGlobalStatistics() {
    let completedDaysCount = 0;
    let totalTasksCount = 0;
    let completedTasksCount = 0;

    // Iterate through all 396 days in tracker period
    MONTHS_CONFIG.forEach(cfg => {
      const daysInMonth = new Date(cfg.year, cfg.month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDateISO(cfg.year, cfg.month, day);
        const dayEntry = trackerData[dateStr];
        if (dayEntry && dayEntry.tasks && dayEntry.tasks.length > 0) {
          const total = dayEntry.tasks.length;
          const completed = dayEntry.tasks.filter(t => t.completed).length;
          totalTasksCount += total;
          completedTasksCount += completed;
          if (completed === total) {
            completedDaysCount++;
          }
        }
      }
    });

    // Calculate progress percentage
    let progressPercentage = 0;
    if (totalTasksCount > 0) {
      progressPercentage = ((completedTasksCount / totalTasksCount) * 100);
    } else {
      progressPercentage = 0;
    }

    const pctFormatted = progressPercentage.toFixed(1) + '%';

    // Update DOM
    if (DOM.statTotalDays) DOM.statTotalDays.textContent = TOTAL_TRACKER_DAYS;
    if (DOM.statCompletedDays) DOM.statCompletedDays.textContent = completedDaysCount;
    if (DOM.statTotalTasks) DOM.statTotalTasks.textContent = `${completedTasksCount} / ${totalTasksCount}`;
    if (DOM.statProgressPercent) DOM.statProgressPercent.textContent = pctFormatted;

    if (DOM.overallProgressBarFill) {
      DOM.overallProgressBarFill.style.width = pctFormatted;
    }
    if (DOM.overallProgressBarTrack) {
      DOM.overallProgressBarTrack.setAttribute('aria-valuenow', Math.round(progressPercentage));
    }
  }

  // --------------------------------------------------------------------------
  // 9. RENDER CURRENT MONTH GRID
  // --------------------------------------------------------------------------
  function renderMonth() {
    const config = MONTHS_CONFIG[currentMonthIndex];
    if (!config) return;

    // Update navigation controls
    DOM.currentMonthLabel.textContent = config.name;
    DOM.btnPrevMonth.disabled = (currentMonthIndex === 0);
    DOM.btnNextMonth.disabled = (currentMonthIndex === MONTHS_CONFIG.length - 1);

    const daysInMonth = new Date(config.year, config.month + 1, 0).getDate();
    const todayISO = getTodayISO();

    // Stats for current month filter counters
    let monthTotalTasks = 0;
    let monthCompletedTasks = 0;
    let monthIncompleteTasks = 0;

    // Pre-calculate month stats
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDateISO(config.year, config.month, day);
      const entry = trackerData[dateStr];
      if (entry && entry.tasks) {
        entry.tasks.forEach(t => {
          monthTotalTasks++;
          if (t.completed) monthCompletedTasks++;
          else monthIncompleteTasks++;
        });
      }
    }

    // Update filter counts
    DOM.countAll.textContent = monthTotalTasks;
    DOM.countCompleted.textContent = monthCompletedTasks;
    DOM.countIncomplete.textContent = monthIncompleteTasks;
    DOM.currentMonthMeta.textContent = `${daysInMonth} days • ${monthTotalTasks} tasks • ${monthCompletedTasks} completed`;

    // Clear grid
    DOM.daysGrid.innerHTML = '';

    // Generate each day card
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDateISO(config.year, config.month, day);
      const dateObj = new Date(config.year, config.month, day);
      const weekday = WEEKDAYS[dateObj.getDay()];
      const isToday = (dateStr === todayISO);

      const dayCard = createDayCardElement({
        dateStr,
        dayNumber: day,
        weekday,
        monthName: MONTH_NAMES[config.month],
        year: config.year,
        isToday
      });

      DOM.daysGrid.appendChild(dayCard);
    }

    // Refresh overall stats
    updateGlobalStatistics();
  }

  // --------------------------------------------------------------------------
  // 10. CREATE INDIVIDUAL DAY CARD DOM
  // --------------------------------------------------------------------------
  function createDayCardElement({ dateStr, dayNumber, weekday, monthName, year, isToday }) {
    const dayEntry = ensureDateEntry(dateStr);
    const dayStatus = getDayStatus(dateStr);

    const card = document.createElement('article');
    card.className = `day-card status-${dayStatus.status}${isToday ? ' is-today' : ''}`;
    card.id = `card-${dateStr}`;
    card.setAttribute('data-date', dateStr);

    // 1. Header Section
    const header = document.createElement('div');
    header.className = 'card-header';

    const dateInfo = document.createElement('div');
    dateInfo.className = 'card-date-info';
    dateInfo.innerHTML = `
      <span class="card-date-num">${dayNumber}</span>
      <div class="card-date-text">
        <span class="card-weekday">${weekday}</span>
        <span class="card-month-year">${monthName} ${year}</span>
      </div>
    `;

    const badges = document.createElement('div');
    badges.className = 'card-badges';

    if (isToday) {
      const todayBadge = document.createElement('span');
      todayBadge.className = 'badge-today';
      todayBadge.textContent = 'TODAY';
      badges.appendChild(todayBadge);
    }

    const statusBadge = document.createElement('span');
    statusBadge.className = `status-badge badge-${dayStatus.status}`;
    statusBadge.textContent = dayStatus.label;
    badges.appendChild(statusBadge);

    header.appendChild(dateInfo);
    header.appendChild(badges);
    card.appendChild(header);

    // 2. Tasks Section
    const tasksSection = document.createElement('div');
    tasksSection.className = 'card-tasks-section';

    const tasksList = document.createElement('ul');
    tasksList.className = 'tasks-list';

    // Apply Filter to tasks
    let visibleTasks = dayEntry.tasks;
    if (currentFilter === 'completed') {
      visibleTasks = dayEntry.tasks.filter(t => t.completed);
    } else if (currentFilter === 'incomplete') {
      visibleTasks = dayEntry.tasks.filter(t => !t.completed);
    }

    if (dayEntry.tasks.length === 0) {
      // Empty state
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'tasks-empty-state';
      emptyDiv.innerHTML = `<span class="tasks-empty-text">No tasks yet</span>`;
      tasksList.appendChild(emptyDiv);
    } else if (visibleTasks.length === 0) {
      // Filtered out state
      const filteredEmpty = document.createElement('div');
      filteredEmpty.className = 'tasks-empty-state';
      filteredEmpty.innerHTML = `<span class="tasks-empty-text">No ${currentFilter} tasks</span>`;
      tasksList.appendChild(filteredEmpty);
    } else {
      visibleTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item${task.completed ? ' is-completed' : ''}`;
        taskItem.setAttribute('data-task-id', task.id);

        // Checkbox button
        const checkBtn = document.createElement('button');
        checkBtn.type = 'button';
        checkBtn.className = 'task-checkbox-btn';
        checkBtn.setAttribute('aria-label', task.completed ? 'Mark task as incomplete' : 'Mark task as completed');
        checkBtn.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
        checkBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleTaskCompletion(dateStr, task.id);
        });

        // Task name
        const taskName = document.createElement('span');
        taskName.className = 'task-name';
        taskName.textContent = task.title;

        const mainGroup = document.createElement('div');
        mainGroup.className = 'task-main';
        mainGroup.appendChild(checkBtn);
        mainGroup.appendChild(taskName);

        // Action Buttons: Edit & Delete
        const actionsGroup = document.createElement('div');
        actionsGroup.className = 'task-actions';

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'task-action-btn btn-edit-task';
        editBtn.title = 'Edit Task';
        editBtn.setAttribute('aria-label', `Edit task: ${task.title}`);
        editBtn.innerHTML = `
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
          </svg>
        `;
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openEditTaskModal(dateStr, task.id, task.title);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'task-action-btn btn-delete-task';
        deleteBtn.title = 'Delete Task';
        deleteBtn.setAttribute('aria-label', `Delete task: ${task.title}`);
        deleteBtn.innerHTML = `
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        `;
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openDeleteTaskModal(dateStr, task.id, task.title);
        });

        actionsGroup.appendChild(editBtn);
        actionsGroup.appendChild(deleteBtn);

        taskItem.appendChild(mainGroup);
        taskItem.appendChild(actionsGroup);
        tasksList.appendChild(taskItem);
      });
    }

    tasksSection.appendChild(tasksList);

    // "+ Add Task" Button
    const addTaskBtn = document.createElement('button');
    addTaskBtn.type = 'button';
    addTaskBtn.className = 'btn-add-task-card';
    addTaskBtn.setAttribute('aria-label', `Add task for ${monthName} ${dayNumber}`);
    addTaskBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      <span>Add Task</span>
    `;
    addTaskBtn.addEventListener('click', () => {
      openAddTaskModal(dateStr, `${monthName} ${dayNumber}, ${year}`);
    });

    tasksSection.appendChild(addTaskBtn);
    card.appendChild(tasksSection);

    // 3. Notes Section
    const notesSection = document.createElement('div');
    notesSection.className = 'card-notes-section';

    const notesHeader = document.createElement('div');
    notesHeader.className = 'notes-header';

    const notesLabel = document.createElement('span');
    notesLabel.className = 'notes-label';
    notesLabel.innerHTML = `
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
      Notes
    `;

    const saveIndicator = document.createElement('span');
    saveIndicator.className = 'notes-save-indicator';
    saveIndicator.textContent = 'Saved';

    notesHeader.appendChild(notesLabel);
    notesHeader.appendChild(saveIndicator);

    const notesInput = document.createElement('textarea');
    notesInput.className = 'day-notes-input';
    notesInput.placeholder = 'Add notes for today...';
    notesInput.value = dayEntry.notes || '';
    notesInput.rows = 2;

    // Auto-save notes on input
    let saveTimeout = null;
    notesInput.addEventListener('input', () => {
      dayEntry.notes = notesInput.value;
      saveDataToStorage();

      saveIndicator.classList.add('visible');
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        saveIndicator.classList.remove('visible');
      }, 1400);
    });

    notesSection.appendChild(notesHeader);
    notesSection.appendChild(notesInput);
    card.appendChild(notesSection);

    return card;
  }

  // --------------------------------------------------------------------------
  // 11. TASK ACTIONS (ADD / EDIT / DELETE / TOGGLE)
  // --------------------------------------------------------------------------
  function openAddTaskModal(dateStr, formattedDate) {
    activeModalTarget.dateStr = dateStr;
    activeModalTarget.taskId = null;

    DOM.addTaskTargetDateDisplay.textContent = `For ${formattedDate}`;
    DOM.addTaskInput.value = '';
    showModal(DOM.addTaskModal);
    setTimeout(() => DOM.addTaskInput.focus(), 50);
  }

  function handleAddTaskSubmit(e) {
    e.preventDefault();
    const title = DOM.addTaskInput.value.trim();
    if (!title || !activeModalTarget.dateStr) return;

    const entry = ensureDateEntry(activeModalTarget.dateStr);
    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: title,
      completed: false
    };

    entry.tasks.push(newTask);
    saveDataToStorage();
    hideModal(DOM.addTaskModal);

    renderMonth();
    showToast('Task added successfully', 'success');
  }

  function openEditTaskModal(dateStr, taskId, currentTitle) {
    activeModalTarget.dateStr = dateStr;
    activeModalTarget.taskId = taskId;

    DOM.editTaskTargetDateDisplay.textContent = formatHumanDate(dateStr);
    DOM.editTaskInput.value = currentTitle;
    showModal(DOM.editTaskModal);
    setTimeout(() => {
      DOM.editTaskInput.focus();
      DOM.editTaskInput.select();
    }, 50);
  }

  function handleEditTaskSubmit(e) {
    e.preventDefault();
    const updatedTitle = DOM.editTaskInput.value.trim();
    if (!updatedTitle || !activeModalTarget.dateStr || !activeModalTarget.taskId) return;

    const entry = trackerData[activeModalTarget.dateStr];
    if (entry && entry.tasks) {
      const task = entry.tasks.find(t => t.id === activeModalTarget.taskId);
      if (task) {
        task.title = updatedTitle;
        saveDataToStorage();
        hideModal(DOM.editTaskModal);
        renderMonth();
        showToast('Task updated', 'success');
      }
    }
  }

  function openDeleteTaskModal(dateStr, taskId, title) {
    activeModalTarget.dateStr = dateStr;
    activeModalTarget.taskId = taskId;

    DOM.deleteTaskNamePreview.textContent = `"${title}"`;
    showModal(DOM.deleteTaskModal);
  }

  function handleConfirmDeleteTask() {
    if (!activeModalTarget.dateStr || !activeModalTarget.taskId) return;

    const entry = trackerData[activeModalTarget.dateStr];
    if (entry && entry.tasks) {
      entry.tasks = entry.tasks.filter(t => t.id !== activeModalTarget.taskId);
      saveDataToStorage();
      hideModal(DOM.deleteTaskModal);
      renderMonth();
      showToast('Task deleted', 'danger');
    }
  }

  function toggleTaskCompletion(dateStr, taskId) {
    const entry = trackerData[dateStr];
    if (entry && entry.tasks) {
      const task = entry.tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        saveDataToStorage();
        renderMonth();
      }
    }
  }

  // --------------------------------------------------------------------------
  // 12. YEAR OVERVIEW MODAL
  // --------------------------------------------------------------------------
  function openYearOverviewModal() {
    DOM.yearOverviewGrid.innerHTML = '';

    MONTHS_CONFIG.forEach((cfg, idx) => {
      const daysInMonth = new Date(cfg.year, cfg.month + 1, 0).getDate();
      let totalTasks = 0;
      let completedTasks = 0;
      let completedDays = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDateISO(cfg.year, cfg.month, day);
        const dayEntry = trackerData[dateStr];
        if (dayEntry && dayEntry.tasks && dayEntry.tasks.length > 0) {
          const total = dayEntry.tasks.length;
          const completed = dayEntry.tasks.filter(t => t.completed).length;
          totalTasks += total;
          completedTasks += completed;
          if (completed === total) {
            completedDays++;
          }
        }
      }

      const pct = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(0) : 0;
      const isCurrentActive = (idx === currentMonthIndex);

      const monthCard = document.createElement('div');
      monthCard.className = `overview-month-card${isCurrentActive ? ' is-current-active' : ''}`;
      monthCard.setAttribute('role', 'button');
      monthCard.setAttribute('tabindex', '0');
      monthCard.setAttribute('aria-label', `Navigate to ${cfg.name}`);

      monthCard.innerHTML = `
        <div class="overview-month-header">
          <span class="overview-month-name">${cfg.name}</span>
          <span class="overview-month-pct">${pct}%</span>
        </div>
        <div class="overview-month-bar-track">
          <div class="overview-month-bar-fill" style="width: ${pct}%;"></div>
        </div>
        <div class="overview-month-stats">
          <span>${completedDays}/${daysInMonth} days complete</span>
          <span>${completedTasks}/${totalTasks} tasks</span>
        </div>
      `;

      const navigateToMonth = () => {
        currentMonthIndex = idx;
        hideModal(DOM.yearOverviewModal);
        renderMonth();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };

      monthCard.addEventListener('click', navigateToMonth);
      monthCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigateToMonth();
        }
      });

      DOM.yearOverviewGrid.appendChild(monthCard);
    });

    showModal(DOM.yearOverviewModal);
  }

  // --------------------------------------------------------------------------
  // 13. SEARCH FEATURE
  // --------------------------------------------------------------------------
  function openSearchModal() {
    showModal(DOM.searchModal);
    DOM.globalSearchInput.value = '';
    DOM.btnClearSearch.hidden = true;
    DOM.searchMatchCount.textContent = '0 matches';
    DOM.searchResultsList.innerHTML = `
      <div class="empty-search-state">
        <p>Start typing to search tasks and notes across all 396 days.</p>
      </div>
    `;
    setTimeout(() => DOM.globalSearchInput.focus(), 50);
  }

  function handleSearchInput() {
    const query = DOM.globalSearchInput.value.trim().toLowerCase();
    DOM.btnClearSearch.hidden = query.length === 0;

    if (query.length < 1) {
      DOM.searchMatchCount.textContent = '0 matches';
      DOM.searchResultsList.innerHTML = `
        <div class="empty-search-state">
          <p>Start typing to search tasks and notes across all 396 days.</p>
        </div>
      `;
      return;
    }

    const matches = [];

    // Search across all dates in tracker period
    MONTHS_CONFIG.forEach(cfg => {
      const daysInMonth = new Date(cfg.year, cfg.month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDateISO(cfg.year, cfg.month, day);
        const dayEntry = trackerData[dateStr];
        if (!dayEntry) continue;

        // Check tasks
        if (dayEntry.tasks && Array.isArray(dayEntry.tasks)) {
          dayEntry.tasks.forEach(t => {
            if (t.title.toLowerCase().includes(query)) {
              matches.push({
                type: 'task',
                dateStr,
                task: t,
                notes: dayEntry.notes
              });
            }
          });
        }

        // Check notes if not already added by a task match
        if (dayEntry.notes && dayEntry.notes.toLowerCase().includes(query)) {
          const alreadyMatched = matches.some(m => m.dateStr === dateStr && m.type === 'notes');
          if (!alreadyMatched) {
            matches.push({
              type: 'notes',
              dateStr,
              notes: dayEntry.notes
            });
          }
        }
      }
    });

    DOM.searchMatchCount.textContent = `${matches.length} match${matches.length === 1 ? '' : 'es'}`;

    if (matches.length === 0) {
      DOM.searchResultsList.innerHTML = `
        <div class="empty-search-state">
          <p>No matches found for "<strong>${escapeHtml(query)}</strong>".</p>
        </div>
      `;
      return;
    }

    DOM.searchResultsList.innerHTML = '';
    matches.forEach(item => {
      const resultItem = document.createElement('div');
      resultItem.className = 'search-result-item';

      const content = document.createElement('div');
      content.className = 'search-result-content';

      const dateLabel = document.createElement('span');
      dateLabel.className = 'search-result-date';
      dateLabel.textContent = formatHumanDate(item.dateStr);
      content.appendChild(dateLabel);

      if (item.type === 'task') {
        const taskText = document.createElement('span');
        taskText.className = 'search-result-task';
        taskText.innerHTML = highlightMatch(item.task.title, query);
        content.appendChild(taskText);
      } else {
        const noteText = document.createElement('span');
        noteText.className = 'search-result-note';
        noteText.innerHTML = `Note: ${highlightMatch(item.notes, query)}`;
        content.appendChild(noteText);
      }

      // Jump button
      const jumpBtn = document.createElement('button');
      jumpBtn.type = 'button';
      jumpBtn.className = 'btn btn-secondary btn-sm';
      jumpBtn.innerHTML = `
        <span>Jump to Date</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      `;

      jumpBtn.addEventListener('click', () => {
        jumpToDate(item.dateStr);
      });

      resultItem.appendChild(content);
      resultItem.appendChild(jumpBtn);
      DOM.searchResultsList.appendChild(resultItem);
    });
  }

  function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return escapeHtml(text).replace(regex, '<span class="highlight">$1</span>');
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function jumpToDate(dateStr) {
    const targetMonthIdx = findMonthIndexForDate(dateStr);
    if (targetMonthIdx === -1) {
      showToast('Date outside tracker period', 'danger');
      return;
    }

    currentMonthIndex = targetMonthIdx;
    hideModal(DOM.searchModal);
    renderMonth();

    // Scroll to the card and trigger highlight animation
    setTimeout(() => {
      const card = document.getElementById(`card-${dateStr}`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.remove('pulse-highlight');
        void card.offsetWidth; // trigger reflow
        card.classList.add('pulse-highlight');
      }
    }, 120);
  }

  // --------------------------------------------------------------------------
  // 14. SETTINGS & BACKUP/RESTORE
  // --------------------------------------------------------------------------
  function exportData() {
    try {
      const dataStr = JSON.stringify(trackerData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `yearly-tracker-backup-${getTodayISO()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Backup JSON exported successfully', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to export backup', 'danger');
    }
  }

  function handleImportFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const parsed = JSON.parse(event.target.result);
        if (typeof parsed !== 'object' || parsed === null) {
          throw new Error('Invalid JSON format');
        }
        trackerData = parsed;
        saveDataToStorage();
        hideModal(DOM.settingsModal);
        renderMonth();
        showToast('Backup restored successfully!', 'success');
      } catch (err) {
        console.error(err);
        showToast('Invalid backup file. Please select a valid JSON backup.', 'danger');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  }

  function loadDemoTasks() {
    trackerData = JSON.parse(JSON.stringify(DEMO_DATA));
    saveDataToStorage();
    hideModal(DOM.settingsModal);
    renderMonth();
    showToast('Demo tasks loaded successfully', 'success');
  }

  function clearAllData() {
    trackerData = {};
    saveDataToStorage();
    hideModal(DOM.clearConfirmModal);
    hideModal(DOM.settingsModal);
    renderMonth();
    showToast('All tracker data has been cleared', 'danger');
  }

  // --------------------------------------------------------------------------
  // 15. MODAL SYSTEM
  // --------------------------------------------------------------------------
  function showModal(modalElement) {
    if (!modalElement) return;
    modalElement.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }

  function hideModal(modalElement) {
    if (!modalElement) return;
    modalElement.setAttribute('hidden', '');
    const anyModalOpen = document.querySelector('.modal-overlay:not([hidden])');
    if (!anyModalOpen) {
      document.body.style.overflow = '';
    }
  }

  function initModals() {
    // Close modal on click of close buttons or outside card
    document.addEventListener('click', (e) => {
      if (e.target.matches('.modal-overlay')) {
        hideModal(e.target);
      }
      const closeBtn = e.target.closest('[data-close]');
      if (closeBtn) {
        const modalId = closeBtn.getAttribute('data-close');
        const modal = document.getElementById(modalId);
        if (modal) hideModal(modal);
      }
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal-overlay:not([hidden])');
        if (openModal) {
          hideModal(openModal);
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // 16. TOAST NOTIFICATION SYSTEM
  // --------------------------------------------------------------------------
  function showToast(message, type = 'info') {
    if (!DOM.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
    } else if (type === 'danger') {
      iconSvg = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      `;
    } else {
      iconSvg = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      `;
    }

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    }, 2400);
  }

  // --------------------------------------------------------------------------
  // 17. EVENT LISTENERS SETUP
  // --------------------------------------------------------------------------
  function setupEventListeners() {
    // Month navigation
    DOM.btnPrevMonth.addEventListener('click', () => {
      if (currentMonthIndex > 0) {
        currentMonthIndex--;
        renderMonth();
      }
    });

    DOM.btnNextMonth.addEventListener('click', () => {
      if (currentMonthIndex < MONTHS_CONFIG.length - 1) {
        currentMonthIndex++;
        renderMonth();
      }
    });

    // Jump to Today
    DOM.btnJumpToday.addEventListener('click', () => {
      const todayISO = getTodayISO();
      if (isWithinTrackerPeriod(todayISO)) {
        jumpToDate(todayISO);
      } else {
        // If outside tracker period, default to October 2026
        currentMonthIndex = 0;
        renderMonth();
        showToast("Today's date is outside the Oct 2026 – Oct 2027 period. Displaying October 2026.", 'info');
      }
    });

    // Filters
    DOM.filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        DOM.filterTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        currentFilter = tab.getAttribute('data-filter') || 'all';
        renderMonth();
      });
    });

    // Form submissions
    DOM.addTaskForm.addEventListener('submit', handleAddTaskSubmit);
    DOM.editTaskForm.addEventListener('submit', handleEditTaskSubmit);
    DOM.btnConfirmDeleteTask.addEventListener('click', handleConfirmDeleteTask);

    // Toolbar buttons
    DOM.btnYearOverview.addEventListener('click', openYearOverviewModal);
    DOM.btnSearch.addEventListener('click', openSearchModal);
    DOM.btnSettings.addEventListener('click', () => showModal(DOM.settingsModal));

    // Search events
    DOM.globalSearchInput.addEventListener('input', handleSearchInput);
    DOM.btnClearSearch.addEventListener('click', () => {
      DOM.globalSearchInput.value = '';
      DOM.globalSearchInput.focus();
      handleSearchInput();
    });

    // Settings events
    DOM.btnExportData.addEventListener('click', exportData);
    DOM.importFileInput.addEventListener('change', handleImportFile);
    DOM.btnLoadDemoData.addEventListener('click', loadDemoTasks);
    DOM.btnOpenClearConfirm.addEventListener('click', () => showModal(DOM.clearConfirmModal));
    DOM.btnConfirmClearAll.addEventListener('click', clearAllData);
  }

  // --------------------------------------------------------------------------
  // 18. APPLICATION INITIALIZATION
  // --------------------------------------------------------------------------
  function init() {
    loadDataFromStorage();
    initModals();
    setupEventListeners();

    // Determine default month:
    // If today is within range (Oct 2026 - Oct 2027), show current month; otherwise default to Oct 2026
    const todayISO = getTodayISO();
    if (isWithinTrackerPeriod(todayISO)) {
      const idx = findMonthIndexForDate(todayISO);
      if (idx !== -1) {
        currentMonthIndex = idx;
      } else {
        currentMonthIndex = 0;
      }
    } else {
      currentMonthIndex = 0;
    }

    renderMonth();
  }

  // Launch when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
