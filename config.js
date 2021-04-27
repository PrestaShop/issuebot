const config = {
  repositories: [
    {
      name: 'PrestaShop',
      nbRequiredApprovals: 2,
      projects: [
        {
          name: 'PrestaShop 1.7.7.4',
          kanbanColumns: {
            // notReadyColumnId: xxxxxxx,
            backlogColumnId: 13559932,
            toBeSpecifiedColumnId: 13559940,
            toDoColumnId: 13168782,
            inProgressColumnId: 13168783,
            toBeReviewedColumnId: 13559943,
            toBeTestedColumnId: 13559944,
            toBerMergedColumnId: 13559948,
            doneColumnId: 13168786,
          },
        },
        {
          name: 'PrestaShop 1.7.8.0',
          kanbanColumns: {
            notReadyColumnId: 7977635,
            backlogColumnId: 6728638,
            toBeSpecifiedColumnId: 7977630,
            toDoColumnId: 6728615,
            inProgressColumnId: 6728616,
            toBeReviewedColumnId: 7309753,
            toBeTestedColumnId: 7309755,
            toBerMergedColumnId: 7309760,
            doneColumnId: 6728617,
          },
        },
      ],
      labels: {
        todo: {name: 'To Do', automatic: true},
        inProgress: {name: 'WIP', automatic: false},
        toBeReproduced: {name: 'TBR', automatic: true},
        toBeSpecified: {name: 'TBS', automatic: true},
        needsMoreInfo: {name: 'NMI', automatic: false},
        toBeTested: {name: 'waiting for QA', automatic: false},
        toBeMerged: {name: 'QA ✔️', automatic: false},
        waitingAuthor: {name: 'waiting for author️', automatic: false},
        fixed: {name: 'Fixed', automatic: true},
      },
      milestones: [
        {
          name: '1.7.7.4',
          project: 'PrestaShop 1.7.7.4',
        },
        {
          name: '1.7.8.0',
          project: 'PrestaShop 1.7.8.0',
        },
      ],
    },
  ],
};

module.exports = config;
