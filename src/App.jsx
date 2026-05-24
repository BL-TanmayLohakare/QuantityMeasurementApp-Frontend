import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import './App.scss';
import * as api from './services/api';

const categoryUnits = {
  LENGTH: ['INCH', 'FEET', 'YARD', 'CENTIMETER'],
  VOLUME: ['GALLON', 'LITRE', 'MILLILITRE'],
  WEIGHT: ['KILOGRAM', 'GRAM', 'TONNE'],
  TEMPERATURE: ['FAHRENHEIT', 'CELSIUS']
};

const formatStr = str => str.charAt(0) + str.slice(1).toLowerCase();

function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = searchParams.get('token');

  const [token, setToken] = useState(tokenFromUrl || localStorage.getItem('jwt_token'));

  const [category, setCategory] = useState('LENGTH');
  const [action, setAction] = useState('convert');

  const [val1, setVal1] = useState(1);
  const [unit1, setUnit1] = useState('INCH');

  const [val2, setVal2] = useState(1);
  const [unit2, setUnit2] = useState('FEET');

  const [targetUnit, setTargetUnit] = useState('INCH');
  const [result, setResult] = useState('1.000');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (tokenFromUrl) {
      localStorage.setItem('jwt_token', tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [tokenFromUrl]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('jwt_token');
    setToken(null);
  }, []);

  const handleLogin = (newToken) => {
    localStorage.setItem('jwt_token', newToken);
    setToken(newToken);
  };

  const handleCategoryChange = useCallback((newCategory) => {
    setCategory(newCategory);
    const units = categoryUnits[newCategory];
    setUnit1(units[0]);
    setUnit2(units.length > 1 ? units[1] : units[0]);
    setTargetUnit(units.length > 1 ? units[1] : units[0]);

    if (newCategory === 'TEMPERATURE' && (action === 'add' || action === 'subtract')) {
      setAction('convert');
    }
  }, [action]);

  useEffect(() => {
    let active = true;

    const performCalculation = async () => {
      if (!token) return;

      try {
        let res;
        if (action === 'convert') {
          res = await api.convertQuantity({ category, value1: val1, unit1, targetUnit });
          if (active) setResult(parseFloat(res.data).toFixed(3));
        } else if (action === 'compare') {
          res = await api.compareQuantities({ category, value1: val1, unit1, value2: val2, unit2 });
          if (active) setResult(res.data ? "Equal" : "Not Equal");
        } else if (action === 'add') {
          res = await api.addQuantities({ category, value1: val1, unit1, value2: val2, unit2, targetUnit });
          if (active) setResult(parseFloat(res.data).toFixed(3));
        } else if (action === 'subtract') {
          res = await api.subtractQuantities({ category, value1: val1, unit1, value2: val2, unit2, targetUnit });
          if (active) setResult(parseFloat(res.data).toFixed(3));
        }
        if (active) setIsError(false);
      } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          if (active) handleLogout();
        } else {
          if (active) {
            setResult("Error");
            setIsError(true);
          }
        }
      }
    };

    performCalculation();

    return () => {
      active = false;
    };
  }, [category, action, val1, unit1, val2, unit2, targetUnit, token, handleLogout]);

  if (!token) {
    
    return (
      <Routes>
        <Route path="/login" element={<SignIn onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  const units = categoryUnits[category];
  const showVal2 = action !== 'convert';
  const showOp = action === 'add' || action === 'subtract';
  const showTargetUnit = action !== 'compare';

  return (
    <Routes>
      <Route path="/" element={
        <div className="app-root">
          <header className="top-banner">
            <h1>Welcome To Quantity Measurement</h1>
            <button onClick={handleLogout} className="logout-btn">Log Out</button>
          </header>

          <div className="main-container">

            <div className="section-title">CHOOSE TYPE</div>
            <div className="category-cards">
              {[
                { id: 'LENGTH', icon: '📐', label: 'Length' },
                { id: 'WEIGHT', icon: '⚖️', label: 'Weight' },
                { id: 'TEMPERATURE', icon: '🌡️', label: 'Temperature' },
                { id: 'VOLUME', icon: '🥛', label: 'Volume' }
              ].map(c => (
                <div
                  key={c.id}
                  className={`card cat-card ${category === c.id ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(c.id)}
                >
                  <div className="icon">{c.icon}</div>
                  <span>{c.label}</span>
                </div>
              ))}
            </div>

            <div className="section-title">CHOOSE ACTION</div>
            <div className="action-tabs">
              {[
                { id: 'compare', label: 'Comparison' },
                { id: 'convert', label: 'Conversion' },
                { id: 'add', label: 'Arithmetic' }
              ].map(a => (
                <button
                  key={a.id}
                  className={`action-tab ${action === a.id || (a.id === 'add' && action === 'subtract') ? 'active' : ''}`}
                  onClick={() => {
                    if (category === 'TEMPERATURE' && a.id === 'add') {
                      alert("Arithmetic operations are not supported for Temperature.");
                      return;
                    }
                    setAction(a.id);
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>

            <div className="calculation-area">
              <div className="input-block">
                <label className="val-label">VALUE 1</label>
                <div className="card input-card">
                  <input type="number" value={val1} onChange={e => setVal1(e.target.value)} />
                  <select className="unit-dropdown" value={unit1} onChange={e => setUnit1(e.target.value)}>
                    {units.map(u => <option key={u} value={u}>{formatStr(u)}</option>)}
                  </select>
                </div>
              </div>

              {showOp && (
                <div className="operator-block">
                  <div className="card op-card" onClick={() => setAction(action === 'add' ? 'subtract' : 'add')}>
                    {action === 'add' ? '+' : '-'}
                  </div>
                </div>
              )}

              {showVal2 && (
                <div className="input-block">
                  <label className="val-label">VALUE 2</label>
                  <div className="card input-card">
                    <input type="number" value={val2} onChange={e => setVal2(e.target.value)} />
                    <select className="unit-dropdown" value={unit2} onChange={e => setUnit2(e.target.value)}>
                      {units.map(u => <option key={u} value={u}>{formatStr(u)}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="result-block">
              <label className="val-label">RESULT</label>
              <div className={`card result-card ${isError ? 'error' : ''}`}>
                <div className="result-value">{result}</div>
                {showTargetUnit && (
                  <select className="unit-dropdown" value={targetUnit} onChange={e => setTargetUnit(e.target.value)}>
                    {units.map(u => <option key={u} value={u}>{formatStr(u)}</option>)}
                  </select>
                )}
              </div>
            </div>

          </div>
        </div>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
