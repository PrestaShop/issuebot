const config = {
  nbRequiredApprovals: 2,
  kanbanColumns: {
    notReadyColumnId: 8032025,
    backlogColumnId: 8032027,
    toBeSpecifiedColumnId: 8032029,
    toDoColumnId: 8032010,
    inProgressColumnId: 8032011,
    toBeReviewedColumnId: 8032031,
    toBeTestedColumnId: 8032032,
    toBerMergedColumnId: 8032037,
    doneColumnId: 8032012,
  },
  labels: {
    todo: {name: 'To Do', automatic: true},
    inProgress: {name: 'WIP', automatic: false},
    toBeReproduced: {name: 'TBR', automatic: true},
    toBeSpecified: {name: 'TBS', automatic: true},
    needsMoreInfo: {name: 'NMI', automatic: true},
    toBeTested: {name: 'waiting for QA', automatic: false},
    toBeMerged: {name: 'QA ✔️', automatic: false},
    waitingAuthor: {name: 'waiting for author️', automatic: false},
    fixed: {name: 'Fixed', automatic: true},
  },
  milestones: {
    next_patch_milestone: '1.7.7.1',
    next_minor_milestone: '1.7.8',
  },
};

module.exports = config;
