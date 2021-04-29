const config = {
  repositories: [
    {
      name: 'PrestaShop',
      nbRequiredApprovals: 2,
      projects: [
        {
          name: 'PrestaShop 1.7.7.5',
          kanbanColumns: {
            // notReadyColumnId: xxxxxxx,
            backlogColumnId: 14065915,
            toBeSpecifiedColumnId: 14065931,
            toDoColumnId: 14065924,
            inProgressColumnId: 14065935,
            toBeReviewedColumnId: 14065943,
            toBeTestedColumnId: 14065945,
            toBerMergedColumnId: 14065951,
            doneColumnId: 14065955,
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
          name: '1.7.7.5',
          project: 'PrestaShop 1.7.7.5',
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
