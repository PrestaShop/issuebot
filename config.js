const config = {
  repositories: [
    {
      name: 'wuffle-test-1',
      nbRequiredApprovals: 1,
      projects: [
        {
          name: 'Multi-board',
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
        },
        {
          name: '1.7.8',
          kanbanColumns: {
            // notReadyColumnId: 8032025,
            // backlogColumnId: 8032027,
            // toBeSpecifiedColumnId: 8032029,
            toDoColumnId: 8356281,
            inProgressColumnId: 8356282,
            // toBeReviewedColumnId: 8032031,
            // toBeTestedColumnId: 8032032,
            // toBerMergedColumnId: 8032037,
            doneColumnId: 8356283,
          },
        },
      ],
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
      milestones: [
        {
          name: '1.7.7.1',
          project: 'Multi-board',
        },
        {
          name: '1.7.8',
          project: '1.7.8',
        },
      ],
    },
    {
      name: 'wuffle-test-2',
      nbRequiredApprovals: 2,
      projects: [
        {
          name: 'Wuffle 2',
          kanbanColumns: {
            notReadyColumnId: 8437263,
            backlogColumnId: 8437257,
            toBeSpecifiedColumnId: 8437270,
            toDoColumnId: 8342936,
            inProgressColumnId: 8342937,
            toBeReviewedColumnId: 8437290,
            toBeTestedColumnId: 8437301,
            toBerMergedColumnId: 8437304,
            doneColumnId: 8342938,
          },
        },
      ],
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
      milestones: [
        {
          name: 'Next version',
          project: 'Wuffle 2',
        },
      ],
    },
  ],
};

module.exports = config;
