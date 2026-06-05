import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Code2, Send, Terminal, Award, History, Info, Play, HelpCircle } from 'lucide-react';
import Loader from '../components/Loader';

const CODE_TEMPLATES = {
  'Two Sum': {
    Python: `def two_sum(nums: list, target: int) -> list:
    # Write your O(N) solution here
    indices_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in indices_map:
            return [indices_map[complement], i]
        indices_map[num] = i
    return []
`,
    JavaScript: `function twoSum(nums, target) {
    // Write your solution here
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}
`
  },
  'Valid Parentheses': {
    Python: `def is_valid(s: str) -> bool:
    # Write stack matching solution
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top_element = stack.pop() if stack else '#'
            if mapping[char] != top_element:
                return False
        else:
            stack.append(char)
    return not stack
`,
    JavaScript: `function isValid(s) {
    // Write stack matching solution
    const stack = [];
    const mapping = {')': '(', '}': '{', ']': '['};
    for (let char of s) {
        if (mapping[char]) {
            const top = stack.length ? stack.pop() : '#';
            if (mapping[char] !== top) {
                return false;
            }
        } else {
            stack.push(char);
        }
    }
    return stack.length === 0;
}
`
  },
  'Reverse a Linked List': {
    Python: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head: ListNode) -> ListNode:
    # Implement linear in-place reversion
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev
`,
    JavaScript: `/*
class ListNode {
    constructor(val = 0, next = null) {
        this.val = val;
        this.next = next;
    }
}
*/
function reverseList(head) {
    let prev = null;
    let curr = head;
    while (curr) {
        let nxt = curr.next;
        curr.next = prev;
        prev = curr;
        curr = nxt;
    }
    return prev;
}
`
  },
  'Binary Tree Level Order Traversal': {
    Python: `from collections import deque

def level_order(root) -> list:
    # Write BFS queue logic
    if not root:
        return []
    result = []
    queue = deque([root])
    while queue:
        level_size = len(queue)
        current_level = []
        for _ in range(level_size):
            node = queue.popleft()
            current_level.append(node.val)
            if node.left: queue.append(node.left)
            if node.right: queue.append(node.right)
        result.append(current_level)
    return result
`,
    JavaScript: `function levelOrder(root) {
    if (!root) return [];
    const result = [];
    const queue = [root];
    while (queue.length > 0) {
        const levelSize = queue.length;
        const currentLevel = [];
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            currentLevel.push(node.val);
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        result.push(currentLevel);
    }
    return result;
}
`
  }
};

const generateStarterTemplate = (title, language) => {
  // Normalize title to a valid function name
  const cleanTitle = title.replace(/[^a-zA-Z0-9\s]/g, '');
  const words = cleanTitle.split(/\s+/).filter(Boolean);
  
  if (words.length === 0) {
    return language === 'JavaScript' 
      ? '// Type your code solution here\n' 
      : '# Type your code solution here\n';
  }

  if (language === 'JavaScript') {
    const camelCaseName = words.map((w, idx) => 
      idx === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    ).join('');
    return `function ${camelCaseName}() {\n    // Write your code here\n    \n}\n`;
  } else {
    const snakeCaseName = words.map(w => w.toLowerCase()).join('_');
    return `def ${snakeCaseName}():\n    # Write your code here\n    pass\n`;
  }
};

const CodingChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [language, setLanguage] = useState('Python');
  const [code, setCode] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Fetch data
  const fetchData = async () => {
    try {
      const [challengesRes, historyRes] = await Promise.all([
        axios.get('/api/challenges'),
        axios.get('/api/challenges/submissions/history')
      ]);
      setChallenges(challengesRes.data);
      setSubmissions(historyRes.data);
    } catch (err) {
      console.error('Failed to load challenges from database', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Set template
  useEffect(() => {
    if (challenges.length > 0) {
      const activeChallenge = challenges[activeIdx];
      const template = CODE_TEMPLATES[activeChallenge.title]?.[language] || generateStarterTemplate(activeChallenge.title, language);
      setCode(template);
      setFeedback(null);
    }
  }, [activeIdx, language, challenges]);

  const handleSubmit = async () => {
    if (!code.trim()) return alert('Please write code before submitting.');
    
    setSubmitting(true);
    setFeedback(null);
    const activeChallenge = challenges[activeIdx];

    try {
      const res = await axios.post(`/api/challenges/${activeChallenge.id}/submit`, {
        code: code
      });
      
      setFeedback({
        score: res.data.score,
        content: res.data.feedback
      });

      // Reload submission history
      const historyRes = await axios.get('/api/challenges/submissions/history');
      setSubmissions(historyRes.data);
    } catch (err) {
      console.error(err);
      alert('Code submission evaluation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader size="large" />;

  const activeChallenge = challenges[activeIdx];

  return (
    <div className="animated-fade-in" style={{ height: '100%' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Coding <span className="gradient-text">Challenges</span>
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Solve mock DSA problems and get granular AI reviews of your complexity efficiency</p>
      </header>

      {challenges.length === 0 ? (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No coding challenges found in database. Create some challenges in the Admin Panel!
        </div>
      ) : (
        <div className="coding-container">
          {/* Left Column: Problem description and past submissions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
            
            {/* Challenge selector */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Select Problem</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {challenges.map((chal, index) => (
                  <button
                    key={chal.id}
                    className={`question-select-btn ${activeIdx === index ? 'active' : ''}`}
                    onClick={() => setActiveIdx(index)}
                    style={{ padding: '0.75rem 1rem' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{chal.title}</span>
                      <span 
                        className="question-status-pill"
                        style={{ 
                          backgroundColor: chal.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                          color: chal.difficulty === 'Easy' ? '#10b981' : '#f59e0b'
                        }}
                      >
                        {chal.difficulty}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Problem instructions */}
            <div className="glass-card" style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Info size={16} color="var(--primary)" />
                <span>Problem Statement</span>
              </h3>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem' }}>{activeChallenge?.title}</h2>
              <div style={{ whiteSpace: 'pre-line', fontSize: '0.95rem', lineHeight: '1.6', color: '#c7d5e6', marginBottom: '1.5rem' }}>
                {activeChallenge?.prompt}
              </div>

              {/* Sample test cases */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Sample Input</h4>
                  <pre style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}>{activeChallenge?.sample_input}</pre>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Sample Output</h4>
                  <pre style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}>{activeChallenge?.sample_output}</pre>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Constraints</h4>
                  <pre style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', color: '#fda4af' }}>{activeChallenge?.constraints}</pre>
                </div>
              </div>

              {/* AI review feedback */}
              {feedback && (
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <Award size={20} color="var(--accent)" />
                    <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>AI Grade: <span className="gradient-text">{feedback.score}/100</span></span>
                  </div>
                  <div 
                    style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', lineHeight: '1.5', whiteSpace: 'pre-wrap', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.02)' }}
                  >
                    {feedback.content}
                  </div>
                </div>
              )}
            </div>
            
            {/* Submissions list */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <History size={16} color="var(--accent)" />
                <span>Your Submissions ({submissions.filter(s => s.challenge_id === activeChallenge.id).length})</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {submissions.filter(s => s.challenge_id === activeChallenge.id).map((sub) => (
                  <div key={sub.id} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(sub.submitted_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: sub.score >= 80 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: sub.score >= 80 ? '#10b981' : '#f59e0b'
                    }}>
                      {sub.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Code editor */}
          <div className="code-editor-area">
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0 }}>
              <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#161b22', borderRadius: '16px 16px 0 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Terminal size={16} color="var(--success)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Editor Console</span>
                </div>
                <select
                  className="input-field"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{ width: '130px', padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                >
                  <option value="Python">Python 3</option>
                  <option value="JavaScript">JavaScript (ES6)</option>
                </select>
              </div>

              <textarea
                className="code-textarea"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={submitting}
                spellCheck="false"
              />

              <div className="editor-footer">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto-saving local draft</span>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  {submitting ? (
                    <span>Assessing...</span>
                  ) : (
                    <>
                      <Play size={14} />
                      <span>Run & Submit Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodingChallenges;
