/* ================================================================
   SIMULYN - Data Layer
   Simulated cloud storage via localStorage + BroadcastChannel
   ================================================================ */

const DB = (() => {

  const KEYS = {
    USERS:        'sim_users',
    PROBLEMS:     'sim_problems',
    SUBMISSIONS:  'sim_submissions',
    TESTS:        'sim_tests',
    VIOLATIONS:   'sim_violations',
    SESSION:      'sim_session',
    TEST_DONE:    'sim_test_done',
  };

  // BroadcastChannel for cross-tab sync (teacher monitor)
  const channel = typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel('simulyn_rt')
    : null;

  function _get(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch { return null; }
  }

  function _set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  function _emit(event, data) {
    if (channel) channel.postMessage({ event, data, ts: Date.now() });
  }

  // ── Seed demo data ────────────────────────────────────────── //
  function seed() {
    // Check if users exist, not just the flag, to prevent empty-DB redirect loops
    const existingUsers = _get(KEYS.USERS);
    if (existingUsers && existingUsers.length > 0) return;

    const users = [
      { id: 'u1', username: 'aditya.sharma',  password: 'student1', role: 'student', displayName: 'Aditya Sharma',   xp: 4440, level: 3, streak: 7, avatar: 'AS', badges: ['first_solve', 'streak7'] },
      { id: 'u2', username: 'priya.nair',     password: 'student2', role: 'student', displayName: 'Priya Nair',      xp: 3910, level: 4, streak: 14, avatar: 'PN', badges: ['first_solve', 'streak7', 'top10'] },
      { id: 'u3', username: 'rohan.mehta',    password: 'student3', role: 'student', displayName: 'Rohan Mehta',     xp: 1910,  level: 2, streak: 2,  avatar: 'RM', badges: ['first_solve'] },
      { id: 'u4', username: 'kavya.patel',    password: 'student4', role: 'student', displayName: 'Kavya Patel',     xp: 5100, level: 5, streak: 21, avatar: 'KP', badges: ['first_solve', 'streak7', 'top10', 'perfect'] },
      { id: 'u5', username: 'arjun.iyer',     password: 'student5', role: 'student', displayName: 'Arjun Iyer',      xp: 2430, level: 2, streak: 4,  avatar: 'AI', badges: ['first_solve'] },
      { id: 'u6', username: 'meera.krishna',  password: 'student6', role: 'student', displayName: 'Meera Krishna',   xp: 4100, level: 4, streak: 10, avatar: 'MK', badges: ['first_solve', 'streak7', 'top10'] },
      { id: 'u7', username: 'dev.anand',      password: 'student7', role: 'student', displayName: 'Dev Anand',       xp: 790,  level: 1, streak: 1,  avatar: 'DA', badges: [] },
      { id: 'u8', username: 'sneha.pillai',   password: 'student8', role: 'student', displayName: 'Sneha Pillai',    xp: 3000, level: 3, streak: 8,  avatar: 'SP', badges: ['first_solve', 'streak7'] },
      { id: 't1', username: 'dr.ramesh',      password: 'teacher1', role: 'teacher', displayName: 'Dr. Ramesh Kumar', avatar: 'RK', subject: 'Data Structures & Algorithms' },
      { id: 't2', username: 'prof.leela',     password: 'teacher2', role: 'teacher', displayName: 'Prof. Leela Menon', avatar: 'LM', subject: 'Electronics & Circuits' },
    ];

    const problems = [
      {
        id: 'p1', type: 'programming', difficulty: 'easy', category: 'Arrays',
        title: 'Two Sum',
        description: 'Given an array of integers `nums` and a target integer `target`, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
        examples: [
          { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
          { input: 'nums = [3,2,4], target = 6',     output: '[1,2]' },
        ],
        constraints: ['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹', 'Only one valid answer exists.'],
        starterCode: {
          python:     'def two_sum(nums, target):\n    # Your solution here\n    pass\n',
          javascript: 'function twoSum(nums, target) {\n    // Your solution here\n}\n',
          cpp:        '#include<vector>\nusing namespace std;\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Your solution here\n}\n',
          java:       'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your solution here\n    }\n}\n',
        },
        testCases: [
          { input: '[2,7,11,15], 9',  expected: '[0,1]' },
          { input: '[3,2,4], 6',      expected: '[1,2]' },
          { input: '[3,3], 6',        expected: '[0,1]' },
        ],
        points: 50,
        hints: [
          'Think about what complement each number needs. If you need 9 and you see 2, what number are you looking for?',
          'A hash map can let you look up the complement in O(1) time. Store each number and its index as you iterate.',
          'For each element x, check if (target - x) already exists in your hash map. If yes, return the indices.',
        ],
        createdBy: 't1',
        tags: ['hash-map', 'array'],
      },
      {
        id: 'p2', type: 'programming', difficulty: 'easy', category: 'Strings',
        title: 'Valid Palindrome',
        description: 'A phrase is a palindrome if, after converting all uppercase letters to lowercase and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string `s`, return `true` if it is a palindrome, or `false` otherwise.',
        examples: [
          { input: 's = "A man, a plan, a canal: Panama"', output: 'true', explanation: '"amanaplanacanalpanama" is a palindrome.' },
          { input: 's = "race a car"', output: 'false' },
        ],
        constraints: ['1 ≤ s.length ≤ 2 × 10⁵', 's consists only of printable ASCII characters.'],
        starterCode: {
          python:     'def is_palindrome(s: str) -> bool:\n    # Your solution here\n    pass\n',
          javascript: 'function isPalindrome(s) {\n    // Your solution here\n}\n',
          cpp:        '#include<string>\nbool isPalindrome(string s) {\n    // Your solution here\n}\n',
          java:       'class Solution {\n    public boolean isPalindrome(String s) {\n        // Your solution here\n    }\n}\n',
        },
        testCases: [
          { input: '"A man, a plan, a canal: Panama"', expected: 'true' },
          { input: '"race a car"', expected: 'false' },
          { input: '" "', expected: 'true' },
        ],
        points: 40,
        hints: [
          'Try cleaning the string first - keep only alphanumeric characters and convert to lowercase.',
          'Two pointers: one at the start, one at the end. Compare characters and move inward.',
          'If at any point the characters don\'t match, it\'s not a palindrome. If the pointers meet, it is.',
        ],
        createdBy: 't1',
        tags: ['string', 'two-pointers'],
      },
      // --- Programming: Medium ---
      {
        id: 'p3', type: 'programming', difficulty: 'medium', category: 'Linked Lists',
        title: 'Reverse a Linked List',
        description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
        examples: [
          { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
          { input: 'head = [1,2]',       output: '[2,1]' },
        ],
        constraints: ['The number of nodes in the list is in the range [0, 5000].', '-5000 ≤ Node.val ≤ 5000'],
        starterCode: {
          python:     'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverse_list(head):\n    # Your solution here\n    pass\n',
          javascript: 'function reverseList(head) {\n    // Your solution here\n}\n',
          cpp:        'struct ListNode { int val; ListNode *next; };\nListNode* reverseList(ListNode* head) {\n    // Your solution here\n}\n',
          java:       'class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Your solution here\n    }\n}\n',
        },
        testCases: [
          { input: '[1,2,3,4,5]', expected: '[5,4,3,2,1]' },
          { input: '[1,2]',       expected: '[2,1]' },
          { input: '[]',          expected: '[]' },
        ],
        points: 100,
        hints: [
          'Think about what information you need to reverse a pointer. You need to know what came before the current node.',
          'Use three pointers: prev (starts null), curr (starts at head), and next (temporary). In each iteration, save next, point curr to prev, advance prev to curr, advance curr to next.',
          'After the loop, prev will be pointing at the new head of the reversed list.',
        ],
        createdBy: 't1',
        tags: ['linked-list', 'iteration', 'recursion'],
      },
      {
        id: 'p4', type: 'programming', difficulty: 'medium', category: 'Trees',
        title: 'Maximum Depth of Binary Tree',
        description: 'Given the root of a binary tree, return its maximum depth. The maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.',
        examples: [
          { input: 'root = [3,9,20,null,null,15,7]', output: '3' },
          { input: 'root = [1,null,2]',               output: '2' },
        ],
        constraints: ['The number of nodes in the tree is in the range [0, 10⁴].', '-100 ≤ Node.val ≤ 100'],
        starterCode: {
          python:     'class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef max_depth(root) -> int:\n    # Your solution here\n    pass\n',
          javascript: 'function maxDepth(root) {\n    // Your solution here\n}\n',
          cpp:        'struct TreeNode { int val; TreeNode *left, *right; };\nint maxDepth(TreeNode* root) {\n    // Your solution here\n}\n',
          java:       'class Solution {\n    public int maxDepth(TreeNode root) {\n        // Your solution here\n    }\n}\n',
        },
        testCases: [],
        points: 120,
        hints: [
          'The depth of a tree is 1 + max(depth of left subtree, depth of right subtree). Does recursion come to mind?',
          'Base case: if the node is null, return 0.',
          'Recursive case: return 1 + Math.max(maxDepth(root.left), maxDepth(root.right))',
        ],
        createdBy: 't1',
        tags: ['tree', 'dfs', 'recursion'],
      },
      // --- Programming: Hard ---
      {
        id: 'p5', type: 'programming', difficulty: 'hard', category: 'Dynamic Programming',
        title: 'Longest Increasing Subsequence',
        description: 'Given an integer array `nums`, return the length of the longest strictly increasing subsequence.',
        examples: [
          { input: 'nums = [10,9,2,5,3,7,101,18]', output: '4', explanation: 'The LIS is [2,3,7,101], therefore the length is 4.' },
          { input: 'nums = [0,1,0,3,2,3]',          output: '4' },
        ],
        constraints: ['1 ≤ nums.length ≤ 2500', '-10⁴ ≤ nums[i] ≤ 10⁴'],
        starterCode: {
          python:     'def length_of_lis(nums) -> int:\n    # Your solution here\n    pass\n',
          javascript: 'function lengthOfLIS(nums) {\n    // Your solution here\n}\n',
          cpp:        '#include<vector>\nint lengthOfLIS(vector<int>& nums) {\n    // Your solution here\n}\n',
          java:       'class Solution {\n    public int lengthOfLIS(int[] nums) {\n        // Your solution here\n    }\n}\n',
        },
        testCases: [],
        points: 200,
        hints: [
          'Try thinking about subproblems. What\'s the length of the LIS ending at each specific index?',
          'dp[i] = length of LIS ending at index i. dp[i] = 1 + max(dp[j]) for all j < i where nums[j] < nums[i].',
          'O(n²) DP works. For O(n log n), use patience sorting with binary search to maintain a sorted "tails" array.',
        ],
        createdBy: 't1',
        tags: ['dp', 'binary-search'],
      },
      // --- Electronics ---
      {
        id: 'e1', type: 'electronics', difficulty: 'easy', category: 'Interactive Sandbox',
        title: 'Interactive Voltage Divider Lab',
        description: 'Use the interactive simulator controls to adjust R1 and R2 dynamically and observe how the output voltage and wire colors change. **Objective:** Find the precise tuning of R1 and R2 that drops the 12V supply to exactly **5.00V** at Vout, ensuring the total circuit resistance does not exceed 12kΩ.',
        schematic: null,
        params: { supply: 12, R1_start: 10000, R2_start: 10000 },
        questions: [
          { id: 'q1', text: 'To achieve Vout = 5.00V with R_total = 12kΩ, what is your tuned R1 (Ω)?', answer: '7000', tolerance: 2 },
          { id: 'q2', text: 'What is your tuned R2 (Ω)?', answer: '5000', tolerance: 2 },
          { id: 'q3', text: 'What is the real-time circuit current at this state (mA)?', answer: '1.0', tolerance: 0.05 },
        ],
        points: 100,
        hints: [
          'Total resistance in series = R1 + R2 = 12000.',
          'Vout = Vsupply × (R2 / (R1 + R2)). Substitute 5 = 12 × (R2 / 12000) to find R2.',
          'Once R2 is found, simply subtract it from 12000 to find R1.',
        ],
        createdBy: 't2',
        tags: ['interactive', 'ohms-law', 'voltage-divider'],
      },
      {
        id: 'e2', type: 'electronics', difficulty: 'medium', category: 'Diode Circuits',
        title: 'LED Current Limiting Resistor',
        description: 'An LED needs 20mA of forward current and has a forward voltage drop of 2.1V. It is connected to a 5V supply. Calculate the value of the series resistor needed to correctly bias the LED.',
        params: { supply: 5, Vled: 2.1, Iled: 20 },
        questions: [
          { id: 'q1', text: 'What is the voltage across the resistor (V)?', answer: '2.9', tolerance: 0.05 },
          { id: 'q2', text: 'What resistance is needed (Ω)?', answer: '145', tolerance: 5 },
          { id: 'q3', text: 'Which standard value (E12 series) would you choose (Ω)?', answer: '150', tolerance: 0 },
        ],
        points: 100,
        hints: [
          'KVL: The voltage across the resistor = Supply voltage − LED forward voltage drop.',
          'Use Ohm\'s Law: R = V / I. Make sure to convert mA to A.',
          'The E12 resistor series values are: 10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82 (and multiples of 10).',
        ],
        createdBy: 't2',
        tags: ['diode', 'led', 'resistor'],
      },
    ];

    const submissions = [
      { id: 's1', userId: 'u1', problemId: 'p1', code: 'def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target-n], i]\n        seen[n] = i', lang: 'python', passed: true,  score: 50,  attempts: 1, ts: Date.now() - 86400000 * 3 },
      { id: 's2', userId: 'u1', problemId: 'p2', code: '', lang: 'python', passed: false, score: 0,   attempts: 2, ts: Date.now() - 86400000 * 2 },
      { id: 's3', userId: 'u2', problemId: 'p1', code: '', lang: 'javascript', passed: true, score: 50, attempts: 1, ts: Date.now() - 86400000 * 5 },
      { id: 's4', userId: 'u2', problemId: 'p2', code: '', lang: 'javascript', passed: true, score: 40, attempts: 2, ts: Date.now() - 86400000 * 4 },
      { id: 's5', userId: 'u2', problemId: 'p3', code: '', lang: 'javascript', passed: true, score: 100, attempts: 1, ts: Date.now() - 86400000 * 2 },
      { id: 's6', userId: 'u4', problemId: 'p1', code: '', lang: 'python', passed: true, score: 50, attempts: 1, ts: Date.now() - 86400000 * 7 },
      { id: 's7', userId: 'u4', problemId: 'p2', code: '', lang: 'python', passed: true, score: 40, attempts: 1, ts: Date.now() - 86400000 * 6 },
      { id: 's8', userId: 'u4', problemId: 'p3', code: '', lang: 'python', passed: true, score: 100, attempts: 1, ts: Date.now() - 86400000 * 5 },
      { id: 's9', userId: 'u4', problemId: 'p4', code: '', lang: 'python', passed: true, score: 120, attempts: 2, ts: Date.now() - 86400000 * 3 },
      { id: 's10',userId: 'u6', problemId: 'p1', code: '', lang: 'cpp', passed: true, score: 50, attempts: 1, ts: Date.now() - 86400000 * 4 },
      { id: 's11',userId: 'u6', problemId: 'p3', code: '', lang: 'cpp', passed: true, score: 100, attempts: 1, ts: Date.now() - 86400000 * 2 },
    ];

    _set(KEYS.USERS, users);
    _set(KEYS.PROBLEMS, problems);
    _set(KEYS.SUBMISSIONS, submissions);
    _set(KEYS.TESTS, []);
    _set(KEYS.VIOLATIONS, []);
    _set('sim_seeded', true);
  }

  // ── User CRUD ─────────────────────────────────────────────── //
  function getUser(id)   { return (_get(KEYS.USERS) || []).find(u => u.id === id); }
  function getUsers()    { return _get(KEYS.USERS) || []; }
  function getStudents() { return getUsers().filter(u => u.role === 'student'); }

  function updateUser(id, patch) {
    const users = getUsers().map(u => u.id === id ? { ...u, ...patch } : u);
    _set(KEYS.USERS, users);
    _emit('user_updated', { id });
  }

  function login(username, password) {
    const user = getUsers().find(u => u.username === username && u.password === password);
    if (!user) return null;
    const session = { userId: user.id, role: user.role, ts: Date.now() };
    _set(KEYS.SESSION, session);
    return user;
  }

  function logout() { localStorage.removeItem(KEYS.SESSION); }

  function getSession() {
    const s = _get(KEYS.SESSION);
    if (!s) return null;
    const user = getUser(s.userId);
    if (!user) {
      // If session exists but user is missing (DB cleared/stale), clear session to prevent loops
      localStorage.removeItem(KEYS.SESSION);
      return null;
    }
    return { ...s, user };
  }

  // ── Problems ──────────────────────────────────────────────── //
  function getProblems(type)  {
    const all = _get(KEYS.PROBLEMS) || [];
    return type ? all.filter(p => p.type === type) : all;
  }
  function getProblem(id) { return getProblems().find(p => p.id === id); }

  function saveProblem(problem) {
    const problems = getProblems();
    const idx = problems.findIndex(p => p.id === problem.id);
    if (idx >= 0) problems[idx] = problem;
    else problems.push(problem);
    _set(KEYS.PROBLEMS, problems);
    _emit('problems_updated', {});
  }

  function deleteProblem(id) {
    const problems = getProblems().filter(p => p.id !== id);
    _set(KEYS.PROBLEMS, problems);
    _emit('problems_updated', {});
  }

  // ── Submissions ───────────────────────────────────────────── //
  function getSubmissions(userId) {
    const all = _get(KEYS.SUBMISSIONS) || [];
    return userId ? all.filter(s => s.userId === userId) : all;
  }

  function addSubmission(sub) {
    const subs = _get(KEYS.SUBMISSIONS) || [];
    const hadPriorPass = subs.some(
      s => s.userId === sub.userId && s.problemId === sub.problemId && s.passed
    );
    subs.push({ ...sub, id: 's' + Date.now(), ts: Date.now() });
    _set(KEYS.SUBMISSIONS, subs);
    _emit('submission', sub);

    if (sub.passed) {
      const problem = getProblem(sub.problemId);
      if (problem && !hadPriorPass) {
        const user = getUser(sub.userId);
        const earned = problem.points || 0;
        updateUser(sub.userId, { xp: (user.xp || 0) + earned });
      }
    }
    return sub;
  }

  function hasSolved(userId, problemId) {
    return getSubmissions(userId).some(s => s.problemId === problemId && s.passed);
  }

  // ── Leaderboard ───────────────────────────────────────────── //
  function getLeaderboard() {
    return getStudents()
      .map(u => ({ ...u, solved: getSubmissions(u.id).filter(s => s.passed).length }))
      .sort((a, b) => b.xp - a.xp);
  }

  // ── Tests (exam sessions) ─────────────────────────────────── //
  function getTests()     { return _get(KEYS.TESTS) || []; }
  function getTest(id)    { return getTests().find(t => t.id === id); }

  function createTest(test) {
    const tests = getTests();
    const newTest = { ...test, id: 'test_' + Date.now(), status: 'active', createdAt: Date.now() };
    tests.push(newTest);
    _set(KEYS.TESTS, tests);
    _emit('test_created', newTest);
    return newTest;
  }

  function updateTest(id, patch) {
    const tests = getTests().map(t => t.id === id ? { ...t, ...patch } : t);
    _set(KEYS.TESTS, tests);
    _emit('test_updated', { id });
  }

  function getTestCompletions(userId) {
    const all = _get(KEYS.TEST_DONE) || [];
    return userId ? all.filter(d => d.userId === userId) : all;
  }

  function markTestCompleted(userId, testId) {
    const arr = _get(KEYS.TEST_DONE) || [];
    if (!arr.some(d => d.userId === userId && d.testId === testId)) {
      arr.push({ userId, testId, ts: Date.now() });
      _set(KEYS.TEST_DONE, arr);
      _emit('test_updated', { id: testId });
    }
  }

  function getActiveTest(userId) {
    const doneIds = new Set(getTestCompletions(userId).map(d => d.testId));
    return getTests().find(
      t =>
        t.status === 'active' &&
        !doneIds.has(t.id) &&
        (t.studentIds.length === 0 || t.studentIds.includes(userId))
    );
  }

  // ── Violations (anti-cheat log) ───────────────────────────── //
  function getViolations(testId) {
    const all = _get(KEYS.VIOLATIONS) || [];
    return testId ? all.filter(v => v.testId === testId) : all;
  }

  function addViolation(v) {
    const violations = _get(KEYS.VIOLATIONS) || [];
    const entry = { ...v, id: 'viol_' + Date.now(), ts: Date.now() };
    violations.push(entry);
    _set(KEYS.VIOLATIONS, violations);
    _emit('violation', entry); // Broadcast to teacher tab
    return entry;
  }

  // ── Analytics ─────────────────────────────────────────────── //
  function getAnalytics(userId) {
    const subs = getSubmissions(userId);
    const solved  = subs.filter(s => s.passed).length;
    const total   = new Set(subs.map(s => s.problemId)).size;
    const accuracy = total > 0 ? Math.round((solved / subs.length) * 100) : 0;
    const langs = subs.reduce((acc, s) => { acc[s.lang] = (acc[s.lang] || 0) + 1; return acc; }, {});
    return { solved, total, accuracy, languages: langs };
  }

  // ── BroadcastChannel listener ─────────────────────────────── //
  function onEvent(callback) {
    if (channel) channel.addEventListener('message', e => callback(e.data));
  }

  return {
    seed, getUser, getUsers, getStudents, updateUser,
    login, logout, getSession,
    getProblems, getProblem, saveProblem, deleteProblem,
    getSubmissions, addSubmission, hasSolved,
    getLeaderboard,
    getTests, getTest, createTest, updateTest, getActiveTest,
    getTestCompletions, markTestCompleted,
    getViolations, addViolation,
    getAnalytics, onEvent,
  };
})();

// Auto-seed on load
DB.seed();
