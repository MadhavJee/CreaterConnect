import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAssets, uploadAsset, deleteAsset } from '../services/api';
import styles from './Dashboard.module.css';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('assets');
    const fileRef = useRef();

    const [messages, setMessages] = useState([
        { id: 1, from: 'system', text: `Welcome, ${user?.name}! ` }
    ]);
    const [input, setInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const res = await getAssets();
            setAssets(res.data.assets);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load assets');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setError('');
        try {
            const res = await uploadAsset(formData);
            setAssets(prev => [res.data.asset, ...prev]);
        } catch (err) {
            console.log('Upload error:', err.response?.data);
            setError(err.response?.data?.message || err.message || 'Upload failed');
        } finally {
            setUploading(false);
            fileRef.current.value = '';
        }
    };

    const handleDelete = async (id) => {
        setError('');
        try {
            await deleteAsset(id);
            setAssets(prev => prev.filter(a => a._id !== id));
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed');
        }
    };

    const handleDownload = (url, filename) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.target = '_blank';
        a.click();
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        setMessages(prev => [...prev, { id: Date.now(), from: 'user', text: input }]);
        setInput('');
        setChatLoading(true);
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1, from: 'bot',
                text: 'Chat API not connected yet!'
            }]);
            setChatLoading(false);
        }, 800);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className={styles.container}>
            {/* Sidebar */}
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>CC</div>
                    <span className={styles.appName}>Creator Connect</span>
                </div>

                <nav className={styles.nav}>
                    <div
                        className={`${styles.navItem} ${activeTab === 'assets' ? styles.navActive : ''}`}
                        onClick={() => setActiveTab('assets')}
                    >
                         Assets
                    </div>
                    <div
                        className={`${styles.navItem} ${activeTab === 'chat' ? styles.navActive : ''}`}
                        onClick={() => setActiveTab('chat')}
                    >
                         Chat
                    </div>
                </nav>

                <div className={styles.sidebarBottom}>
                    <div className={styles.userInfo}>
                        <div className={styles.avatar}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className={styles.userName}>{user?.name}</p>
                            <p className={styles.userRole}>{user?.role}</p>
                        </div>
                    </div>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        Sign out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.main}>
                {activeTab === 'assets' ? (
                    <>
                        <div className={styles.header}>
                            <div>
                                <h1>My Assets</h1>
                                <p className={styles.subtitle}>{assets.length} files uploaded</p>
                            </div>
                            <div className={styles.headerActions}>
                                <span className={styles.tokenBadge}>
                                     {user?.tokens || 5} tokens
                                </span>
                                <button
                                    className={styles.uploadBtn}
                                    onClick={() => fileRef.current.click()}
                                    disabled={uploading}
                                >
                                    {uploading ? 'Uploading...' : '+ Upload'}
                                </button>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleUpload}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>

                        {error && <p className={styles.error}> {error}</p>}

                        {loading ? (
                            <div className={styles.emptyState}>
                                <p>Loading...</p>
                            </div>
                        ) : assets.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>No assets yet</p>
                                <button
                                    className={styles.uploadBtn}
                                    onClick={() => fileRef.current.click()}
                                >
                                    Upload your first file
                                </button>
                            </div>
                        ) : (
                            <div className={styles.grid}>
                                {assets.map(asset => (
                                    <div key={asset._id} className={styles.card}>
                                        <div className={styles.imageWrapper}>
                                            <img src={asset.url} alt={asset.filename} />
                                        </div>
                                        <div className={styles.cardInfo}>
                                            <p className={styles.filename}>{asset.filename}</p>
                                            <p className={styles.filesize}>
                                                {asset.format?.toUpperCase()} • {(asset.size / 1024).toFixed(1)} KB
                                            </p>
                                            <div className={styles.cardActions}>
                                                <button
                                                    className={styles.downloadBtn}
                                                    onClick={() => handleDownload(asset.url, asset.filename)}
                                                >
                                                     Download
                                                </button>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => handleDelete(asset._id)}
                                                >
                                                     Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className={styles.chatContainer}>
                        <div className={styles.header}>
                            <h1>Chat</h1>
                            <span className={styles.tokenBadge}>
                                 {user?.tokens || 5} tokens
                            </span>
                        </div>
                        <div className={styles.messages}>
                            {messages.map(msg => (
                                <div key={msg.id} className={`${styles.message} ${styles[msg.from]}`}>
                                    {msg.from !== 'user' && (
                                        <div className={styles.msgAvatar}>
                                            {msg.from === 'system' ? '⚡' : 'CC'}
                                        </div>
                                    )}
                                    <div className={styles.msgBubble}>{msg.text}</div>
                                </div>
                            ))}
                            {chatLoading && (
                                <div className={`${styles.message} ${styles.bot}`}>
                                    <div className={styles.msgAvatar}>CC</div>
                                    <div className={styles.msgBubble}>
                                        <span className={styles.typing}>
                                            <span /><span /><span />
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <form className={styles.inputArea} onSubmit={handleSend}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                className={styles.chatInput}
                            />
                            <button
                                type="submit"
                                className={styles.sendBtn}
                                disabled={chatLoading || !input.trim()}
                            >
                                Send →
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}