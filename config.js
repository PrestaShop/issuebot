const config = {
  repositories: [
    {
      name: 'PrestaShop',
      nbRequiredApprovals: 2,
      topwatchersThreshold: 5,
      excludedUsersFromTopwatchers: [
        'prestashop-issue-bot',
        'prestashop-issue-bot[bot]',
        'sentimentbot',
        'sentimentbot[bot]',
        'top-issues',
        'top-issues[bot]',
        'travis-ci',
        'travis-ci[bot]',
        'ps-jarvis',
        'ps-jarvis[bot]',
        'prestonBot',
        'prestonBot[bot]',
        'dependabot',
        'dependabot[bot]',
        'atomiix',
        'eternoendless',
        'jolelievre',
        'kpodemski',
        'matks',
        'matthieu-rolland',
        'NeOMakinG',
        'Progi1984',
        'PululuK',
        'sowbiba',
        'khouloudbelguith',
        'Robin-Fischer-PS',
        'MatShir',
        'hibatallahAouadni',
        'florine2623',
        'Julievrz',
        'boubkerbribri',
        'ldeprestashop',
        'nesrineabdmouleh',
        'prestascott',
        'RomainBocheux',
        'sarahdib',
        'SD1982',
        'TristanLDD',
        'marwachelly',
        'AureRita',
      ],
      projects: [
        {
          name: 'PrestaShop 1.7.8.7',
          kanbanColumns: {
            notReadyColumnId: 18547630,
            toDoColumnId: 18547740,
            toBeSpecifiedColumnId: 18549306,
            inProgressColumnId: 18547631,
            toBeReviewedColumnId: 18547742,
            toBeTestedColumnId: 18547747,
            toBeMergedColumnId: 18547749,
            doneColumnId: 18547632,
          },
        },
        {
          name: 'PrestaShop 8.0.0',
          kanbanColumns: {
            notReadyColumnId: 10578078,
            toDoColumnId: 10578080,
            toBeSpecifiedColumnId: 10578091,
            inProgressColumnId: 10578096,
            toBeReviewedColumnId: 10578098,
            toBeTestedColumnId: 10578100,
            toBeMergedColumnId: 10578102,
            doneColumnId: 10578112,
          },
        },
      ],
      labels: {
        todo: {name: 'To Do', automatic: true},
        ready: {name: 'Ready', automatic: true},
        inAnalysis: {name: 'In analysis', automatic: true},
        inProgress: {name: 'WIP', automatic: true},
        needsMoreInfo: {name: 'NMI', automatic: false},
        needsSpecs: {name: 'Needs Specs', automatic: true},
        toBeTested: {name: 'Waiting for QA', automatic: false},
        toBeMerged: {name: 'QA ✔️', automatic: false},
        waitingAuthor: {name: 'Waiting for author', automatic: false},
        fixed: {name: 'Fixed', automatic: true},
        topWatchers: {name: 'Topwatchers', automatic: false},
        rejected: {name: 'Rejected', automatic: false},
        blocked: {name: 'Blocked', automatic: true},
      },
      milestones: [
        {
          name: '1.7.8.6',
          project: 'PrestaShop 1.7.8.6',
        },
        {
          name: '8.0.0',
          project: 'PrestaShop 8.0.0',
        },
      ],
    },
  ],
  maxiKanban: {
    id: 'PN_kwDOACr20M08Jw',
    columns: {
      notReadyColumnId: 'f75ad846',
      toDoColumnId: '2f00dcef',
      toBeSpecifiedColumnId: '85679661',
      inProgressColumnId: '47fc9ee4',
      toBeReviewedColumnId: '427af469',
      toBeTestedColumnId: '31621680',
      toBeMergedColumnId: '2cd7b745',
      doneColumnId: '98236657',
    },
  },
};

module.exports = config;
