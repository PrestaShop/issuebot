const config = {
  repositories: [
    {
      name: 'PrestaShop',
      nbRequiredApprovals: 2,
      projects: [
        {
          name: 'PrestaShop 1.7.7',
          kanbanColumns: {
            // notReadyColumnId: xxxxxxx,
            backlogColumnId: 4843009,
            toBeSpecifiedColumnId: 7804937,
            toDoColumnId: 4336345,
            inProgressColumnId: 4336346,
            toBeReviewedColumnId: 4336353,
            toBeTestedColumnId: 4867632,
            toBerMergedColumnId: 4336379,
            doneColumnId: 4336347,
          },
        },
        {
          name: 'PrestaShop 1.7.8',
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
          name: '1.7.7.0',
          project: 'PrestaShop 1.7.7',
        },
        {
          name: '1.7.8.0',
          project: 'PrestaShop 1.7.8',
        },
      ],
    },
  ],
};

module.exports = config;
