const config = {
    nbRequiredApprovals: 2,
    kanbanColumns: {
        notReadyColumnId: 8032025,
        backlogColumnId: 8032027,
        toBeSpecifiedColumnId: 8032029,
        toDoColumnId: 3311230,
        inProgressColumnId: 3311231,
        toBeReviewedColumnId: 3311232,
        toBeTestedColumnId: 3329346,
        toBeMergedColumnId: 3329347,
        doneColumnId: 3329348,
    },
    labels: {
        todo: {name: 'To Do', automatic: true},
        inProgress: {name: 'WIP', automatic: false},
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