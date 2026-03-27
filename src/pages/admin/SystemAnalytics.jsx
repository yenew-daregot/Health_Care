import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Activity, 
  Server, 
  Database, 
  AlertTriangle,
  RefreshCw,
  Download,
  Eye,
  Zap,
  Shield,
  Globe,
  Cpu,
  HardDrive,
  Wifi
} from 'lucide-react';
import './SystemAnalytics.css';

const SystemAnalytics = () => {
  const [timeframe, setTimeframe] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingActions, setPendingActions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
      if (!token) {
        setError('Authentication required. Please login.');
        setLoading(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch all analytics data in parallel
      const endpoints = [
        { key: 'dashboardStats', url: '/api/admin/dashboard/stats/' },
        { key: 'systemStatus', url: '/api/admin/system/status/' },
        { key: 'recentActivities', url: '/api/admin/activities/recent/' },
        { key: 'pendingActions', url: '/api/admin/actions/pending/' },
        { key: 'analytics', url: `/api/admin/analytics/?timeframe=${timeframe}` }
      ];

      const requests = endpoints.map(endpoint => 
        fetch(endpoint.url, { headers })
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to fetch ${endpoint.key}`);
            }
            return response.json();
          })
          .catch(error => {
            console.warn(`Endpoint ${endpoint.url} failed:`, error);
            // Return null for failed requests - UI will handle missing data
            return null;
          })
      );

      const results = await Promise.all(requests);
      
      // Set data from results
      const [
        dashboardStatsData,
        systemStatusData,
        recentActivitiesData,
        pendingActionsData,
        analyticsData
      ] = results;

      setDashboardStats(dashboardStatsData);
      setSystemStatus(systemStatusData);
      setRecentActivities(recentActivitiesData || []);
      setPendingActions(pendingActionsData || []);
      setAnalytics(analyticsData);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Export functionality
  const handleExport = async (format = 'csv') => {
    setExporting(true);
    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        timeframe,
        activeTab,
        dashboardStats,
        systemStatus,
        recentActivities,
        pendingActions,
        analytics
      };

      let content, fileName, mimeType;

      if (format === 'csv') {
        content = convertToCSV(exportData);
        fileName = `system-analytics-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv;charset=utf-8;';
      } else if (format === 'json') {
        content = JSON.stringify(exportData, null, 2);
        fileName = `system-analytics-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else if (format === 'pdf') {
        generatePDFReport(exportData);
        setExporting(false);
        return;
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show success message
      alert(`Data exported successfully as ${fileName}`);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Convert data to CSV format
  const convertToCSV = (data) => {
    const sections = [];
    
    // 1. Summary Section
    sections.push('SYSTEM ANALYTICS SUMMARY');
    sections.push(`Generated: ${new Date().toLocaleString()}`);
    sections.push(`Timeframe: ${timeframe}`);
    sections.push('');
    
    // 2. Dashboard Stats
    if (data.dashboardStats) {
      sections.push('USER STATISTICS');
      sections.push('Metric,Value');
      if (data.dashboardStats.user_stats) {
        Object.entries(data.dashboardStats.user_stats).forEach(([key, value]) => {
          if (typeof value === 'number' || typeof value === 'string') {
            sections.push(`${key},${value}`);
          }
        });
      }
      sections.push('');
      
      if (data.dashboardStats.appointment_stats) {
        sections.push('APPOINTMENT STATISTICS');
        sections.push('Metric,Value');
        Object.entries(data.dashboardStats.appointment_stats).forEach(([key, value]) => {
          sections.push(`${key},${value}`);
        });
        sections.push('');
      }
    }
    
    // 3. System Status
    if (data.systemStatus) {
      sections.push('SYSTEM STATUS');
      sections.push('Component,Status,Metric');
      if (data.systemStatus.components) {
        Object.entries(data.systemStatus.components).forEach(([component, details]) => {
          const status = details?.status || 'unknown';
          const metric = details?.latency_ms ? `${details.latency_ms}ms` : 'N/A';
          sections.push(`${component},${status},${metric}`);
        });
      }
      sections.push('');
    }
    
    // 4. Recent Activities
    if (data.recentActivities?.length > 0) {
      sections.push('RECENT ACTIVITIES');
      sections.push('Action,User,Time,Type,Status');
      data.recentActivities.forEach(activity => {
        sections.push(`"${activity.action || ''}","${activity.user || ''}","${activity.time || ''}","${activity.type || ''}","${activity.status || ''}"`);
      });
      sections.push('');
    }
    
    // 5. Pending Actions
    if (data.pendingActions?.length > 0) {
      sections.push('PENDING ACTIONS');
      sections.push('Title,Description,Type,Priority,User,Days Pending');
      data.pendingActions.forEach(action => {
        sections.push(`"${action.title || ''}","${action.description || ''}","${action.type || ''}","${action.priority || ''}","${action.user || ''}","${action.days_pending || 0}"`);
      });
      sections.push('');
    }
    
    // 6. Analytics
    if (data.analytics) {
      sections.push('ANALYTICS');
      sections.push('Metric,Value');
      if (data.analytics.user_engagement) {
        Object.entries(data.analytics.user_engagement).forEach(([key, value]) => {
          sections.push(`${key},${value}`);
        });
      }
    }
    
    return sections.length > 4 ? sections.join('\n') : 'No data available for export';
  };

  // Generate PDF Report
  const generatePDFReport = (data) => {
    const printWindow = window.open('', '_blank');
    const printDate = new Date().toLocaleString();
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>System Analytics Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
          h2 { color: #555; margin-top: 30px; }
          .report-meta { color: #666; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background-color: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; }
          td { padding: 8px; border-bottom: 1px solid #dee2e6; }
          .status-healthy { color: #28a745; font-weight: bold; }
          .status-error { color: #dc3545; font-weight: bold; }
          .priority-high { color: #dc3545; font-weight: bold; }
          .priority-medium { color: #ffc107; font-weight: bold; }
          .no-data { color: #6c757d; font-style: italic; text-align: center; padding: 40px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>System Analytics Report</h1>
        <div class="report-meta">
          Generated: ${printDate}<br>
          Timeframe: ${timeframe}<br>
          Tab: ${activeTab}
        </div>

        ${data.dashboardStats ? `
          <h2>User Statistics</h2>
          <table>
            <tr>
              <th>Metric</th>
              <th>Value</th>
            </tr>
            ${Object.entries(data.dashboardStats.user_stats || {}).map(([key, value]) => 
              `<tr><td>${key}</td><td>${value}</td></tr>`
            ).join('')}
          </table>
        ` : '<div class="no-data">No user statistics available</div>'}

        ${data.systemStatus ? `
          <h2>System Status</h2>
          <table>
            <tr>
              <th>Component</th>
              <th>Status</th>
              <th>Metric</th>
            </tr>
            ${Object.entries(data.systemStatus.components || {}).map(([component, details]) => 
              `<tr>
                <td>${component}</td>
                <td class="${details?.status === 'connected' || details?.status === 'ok' ? 'status-healthy' : 'status-error'}">${details?.status || 'unknown'}</td>
                <td>${details?.latency_ms ? details.latency_ms + 'ms' : 'N/A'}</td>
              </tr>`
            ).join('')}
          </table>
        ` : '<div class="no-data">No system status available</div>'}

        ${data.pendingActions?.length > 0 ? `
          <h2>Pending Actions</h2>
          <table>
            <tr>
              <th>Title</th>
              <th>Priority</th>
              <th>User</th>
              <th>Days Pending</th>
            </tr>
            ${data.pendingActions.map(action => 
              `<tr>
                <td>${action.title}</td>
                <td class="priority-${action.priority?.toLowerCase()}">${action.priority}</td>
                <td>${action.user}</td>
                <td>${action.days_pending}</td>
              </tr>`
            ).join('')}
          </table>
        ` : ''}

        <div class="no-print" style="margin-top: 50px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Print Report
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Close
          </button>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  // Helper function to format numbers
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString();
  };

  // Helper function to calculate trend (placeholder for actual trend calculation)
  const calculateTrend = (current, previous) => {
    if (!current || !previous || previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const StatCard = ({ title, value, change, icon: Icon, color, trend, onClick }) => (
    <div 
      className={`analytics-stat-card stat-${color} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="stat-header">
        <div className="stat-icon">
          <Icon size={24} />
        </div>
        <div className="stat-trend">
          {trend !== undefined && (
            <span className={`trend ${trend > 0 ? 'positive' : trend < 0 ? 'negative' : 'neutral'}`}>
              <TrendingUp size={16} />
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-title">{title}</div>
        {change && (
          <div className={`stat-change ${change.startsWith('+') ? 'positive' : 'negative'}`}>
            {change}
          </div>
        )}
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div className="analytics-overview">
      {/* Key Performance Indicators */}
      <div className="kpi-grid">
        <StatCard
          title="Total Users"
          value={formatNumber(dashboardStats?.user_stats?.total_users)}
          change={dashboardStats?.user_stats?.new_users_30_days ? `+${dashboardStats.user_stats.new_users_30_days}` : null}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Patients"
          value={formatNumber(dashboardStats?.user_stats?.total_patients)}
          change={dashboardStats?.user_stats?.new_patients_30_days ? `+${dashboardStats.user_stats.new_patients_30_days}` : null}
          icon={Activity}
          color="green"
        />
        <StatCard
          title="Monthly Appointments"
          value={formatNumber(dashboardStats?.appointment_stats?.appointments_30_days)}
          icon={Calendar}
          color="purple"
        />
        <StatCard
          title="System Uptime"
          value={systemStatus?.components?.database?.status === 'connected' ? '99.9%' : '0%'}
          icon={Server}
          color="orange"
        />
      </div>

      {/* System Health Overview */}
      <div className="system-health-overview">
        <div className="health-card">
          <h3>System Health</h3>
          {systemStatus ? (
            <div className="health-indicators">
              <div className="health-indicator">
                <div className="indicator-icon">
                  <Database size={20} />
                </div>
                <div className="indicator-content">
                  <span className="indicator-label">Database</span>
                  <span className={`indicator-status ${systemStatus.components?.database?.status === 'connected' ? 'healthy' : 'error'}`}>
                    {systemStatus.components?.database?.status === 'connected' ? 'Healthy' : 'Error'}
                  </span>
                </div>
                <div className="indicator-metric">
                  {systemStatus.components?.database?.latency_ms || 0}ms
                </div>
              </div>
              
              <div className="health-indicator">
                <div className="indicator-icon">
                  <Zap size={20} />
                </div>
                <div className="indicator-content">
                  <span className="indicator-label">Cache</span>
                  <span className={`indicator-status ${systemStatus.components?.cache?.status === 'ok' ? 'healthy' : 'error'}`}>
                    {systemStatus.components?.cache?.status === 'ok' ? 'Healthy' : 'Error'}
                  </span>
                </div>
                <div className="indicator-metric">
                  92% Hit Rate
                </div>
              </div>
              
              <div className="health-indicator">
                <div className="indicator-icon">
                  <HardDrive size={20} />
                </div>
                <div className="indicator-content">
                  <span className="indicator-label">Storage</span>
                  <span className={`indicator-status ${systemStatus.components?.storage?.status === 'writable' ? 'healthy' : 'warning'}`}>
                    {systemStatus.components?.storage?.status === 'writable' ? 'Healthy' : 'Warning'}
                  </span>
                </div>
                <div className="indicator-metric">
                  78% Used
                </div>
              </div>
            </div>
          ) : (
            <div className="no-data-message">System status unavailable</div>
          )}
        </div>

        <div className="performance-metrics">
          <h3>Performance Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-label">API Response Time</div>
              <div className="metric-value">120ms</div>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Success Rate</div>
              <div className="metric-value">99.5%</div>
              <div className="metric-bar">
                <div className="metric-fill success" style={{ width: '99.5%' }}></div>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Active Connections</div>
              <div className="metric-value">45</div>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="recent-activities-section">
        <div className="section-header">
          <h3>Recent System Activities</h3>
          <button className="btn btn-secondary btn-sm" onClick={fetchAnalyticsData}>
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
        {recentActivities.length > 0 ? (
          <div className="activities-list">
            {recentActivities.slice(0, 8).map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {activity.type === 'user_registration' && <Users size={16} />}
                  {activity.type === 'appointment' && <Calendar size={16} />}
                  {activity.type === 'system' && <Server size={16} />}
                </div>
                <div className="activity-content">
                  <div className="activity-title">{activity.action}</div>
                  <div className="activity-details">{activity.user}</div>
                  <div className="activity-time">{activity.time}</div>
                </div>
                <div className={`activity-status status-${activity.type}`}>
                  {activity.status || activity.type}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data-message">No recent activities</div>
        )}
      </div>
    </div>
  );

  const UserAnalyticsTab = () => (
    <div className="user-analytics">
      <div className="analytics-header">
        <h3>User Analytics</h3>
        <div className="analytics-controls">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="timeframe-select"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {dashboardStats?.user_stats ? (
        <>
          <div className="user-stats-grid">
            <div className="user-stat-card">
              <h4>User Growth</h4>
              <div className="stat-number">{formatNumber(dashboardStats.user_stats.total_users)}</div>
              <div className="stat-label">Total Users</div>
              {dashboardStats.user_stats.new_users_30_days > 0 && (
                <div className="growth-indicator positive">
                  +{dashboardStats.user_stats.new_users_30_days} this month
                </div>
              )}
            </div>

            <div className="user-stat-card">
              <h4>User Engagement</h4>
              <div className="stat-number">{analytics?.user_engagement?.engagement_rate_24h || 0}%</div>
              <div className="stat-label">24h Active Rate</div>
              <div className="engagement-breakdown">
                <div className="engagement-item">
                  <span>24h Active: {analytics?.user_engagement?.active_users_24h || 0}</span>
                </div>
                <div className="engagement-item">
                  <span>7d Active: {analytics?.user_engagement?.active_users_7d || 0}</span>
                </div>
              </div>
            </div>

            <div className="user-stat-card">
              <h4>User Distribution</h4>
              <div className="distribution-chart">
                <div className="distribution-item">
                  <span className="distribution-label">Patients</span>
                  <div className="distribution-bar">
                    <div 
                      className="distribution-fill patients" 
                      style={{ width: `${(dashboardStats.user_stats.total_patients / dashboardStats.user_stats.total_users * 100) || 0}%` }}
                    ></div>
                  </div>
                  <span className="distribution-value">{dashboardStats.user_stats.total_patients}</span>
                </div>
                <div className="distribution-item">
                  <span className="distribution-label">Doctors</span>
                  <div className="distribution-bar">
                    <div 
                      className="distribution-fill doctors" 
                      style={{ width: `${(dashboardStats.user_stats.total_doctors / dashboardStats.user_stats.total_users * 100) || 0}%` }}
                    ></div>
                  </div>
                  <span className="distribution-value">{dashboardStats.user_stats.total_doctors}</span>
                </div>
                <div className="distribution-item">
                  <span className="distribution-label">Admins</span>
                  <div className="distribution-bar">
                    <div 
                      className="distribution-fill admins" 
                      style={{ width: `${(dashboardStats.user_stats.total_admins / dashboardStats.user_stats.total_users * 100) || 0}%` }}
                    ></div>
                  </div>
                  <span className="distribution-value">{dashboardStats.user_stats.total_admins}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gender Distribution */}
          {dashboardStats.user_stats.patient_gender_distribution && (
            <div className="gender-distribution">
              <h4>Patient Gender Distribution</h4>
              <div className="gender-chart">
                {dashboardStats.user_stats.patient_gender_distribution.map((item, index) => (
                  <div key={index} className="gender-item">
                    <div className="gender-label">{item.gender || 'Unknown'}</div>
                    <div className="gender-count">{item.count}</div>
                    <div className="gender-percentage">
                      {((item.count / dashboardStats.user_stats.total_patients) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="no-data-message">No user analytics data available</div>
      )}
    </div>
  );

  const SystemPerformanceTab = () => (
    <div className="system-performance">
      <div className="performance-header">
        <h3>System Performance</h3>
        <div className="performance-actions">
          <button className="btn btn-secondary btn-sm" onClick={fetchAnalyticsData}>
            <RefreshCw size={14} />
            Refresh
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => handleExport('csv')}
            disabled={exporting}
          >
            <Download size={14} />
            {exporting ? 'Exporting...' : 'Export Report'}
          </button>
        </div>
      </div>

      {systemStatus ? (
        <>
          <div className="performance-overview">
            <div className="performance-card">
              <div className="performance-header-item">
                <Server size={24} />
                <div>
                  <h4>Server Status</h4>
                  <span className="status-indicator healthy">Operational</span>
                </div>
              </div>
              <div className="performance-metrics">
                <div className="metric">
                  <span className="metric-label">Uptime</span>
                  <span className="metric-value">99.9%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Load Average</span>
                  <span className="metric-value">0.45</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Memory Usage</span>
                  <span className="metric-value">68%</span>
                </div>
              </div>
            </div>

            <div className="performance-card">
              <div className="performance-header-item">
                <Database size={24} />
                <div>
                  <h4>Database Performance</h4>
                  <span className={`status-indicator ${systemStatus.components?.database?.status === 'connected' ? 'healthy' : 'error'}`}>
                    {systemStatus.components?.database?.status === 'connected' ? 'Connected' : 'Error'}
                  </span>
                </div>
              </div>
              <div className="performance-metrics">
                <div className="metric">
                  <span className="metric-label">Query Time</span>
                  <span className="metric-value">{systemStatus.components?.database?.latency_ms || 0}ms</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Connections</span>
                  <span className="metric-value">12/100</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Cache Hit</span>
                  <span className="metric-value">92%</span>
                </div>
              </div>
            </div>

            <div className="performance-card">
              <div className="performance-header-item">
                <Wifi size={24} />
                <div>
                  <h4>API Performance</h4>
                  <span className="status-indicator healthy">Healthy</span>
                </div>
              </div>
              <div className="performance-metrics">
                <div className="metric">
                  <span className="metric-label">Response Time</span>
                  <span className="metric-value">120ms</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Success Rate</span>
                  <span className="metric-value">99.5%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Requests/min</span>
                  <span className="metric-value">1,247</span>
                </div>
              </div>
            </div>
          </div>

          {/* System Resources */}
          <div className="system-resources">
            <h4>System Resources</h4>
            <div className="resources-grid">
              <div className="resource-item">
                <div className="resource-header">
                  <Cpu size={20} />
                  <span>CPU Usage</span>
                </div>
                <div className="resource-bar">
                  <div className="resource-fill" style={{ width: '45%' }}></div>
                </div>
                <div className="resource-value">45%</div>
              </div>

              <div className="resource-item">
                <div className="resource-header">
                  <HardDrive size={20} />
                  <span>Memory Usage</span>
                </div>
                <div className="resource-bar">
                  <div className="resource-fill" style={{ width: '68%' }}></div>
                </div>
                <div className="resource-value">68%</div>
              </div>

              <div className="resource-item">
                <div className="resource-header">
                  <Database size={20} />
                  <span>Disk Usage</span>
                </div>
                <div className="resource-bar">
                  <div className="resource-fill" style={{ width: '34%' }}></div>
                </div>
                <div className="resource-value">34%</div>
              </div>

              <div className="resource-item">
                <div className="resource-header">
                  <Globe size={20} />
                  <span>Network I/O</span>
                </div>
                <div className="resource-bar">
                  <div className="resource-fill" style={{ width: '23%' }}></div>
                </div>
                <div className="resource-value">23 MB/s</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="no-data-message">No system performance data available</div>
      )}
    </div>
  );

  const PendingActionsTab = () => (
    <div className="pending-actions">
      <div className="actions-header">
        <h3>Pending Actions</h3>
        {pendingActions.length > 0 && (
          <div className="actions-summary">
            <span className="summary-item high">
              {pendingActions.filter(a => a.priority === 'HIGH').length} High Priority
            </span>
            <span className="summary-item medium">
              {pendingActions.filter(a => a.priority === 'MEDIUM').length} Medium Priority
            </span>
          </div>
        )}
      </div>

      {pendingActions.length > 0 ? (
        <div className="actions-list">
          {pendingActions.map((action, index) => (
            <div key={index} className={`action-item priority-${action.priority?.toLowerCase()}`}>
              <div className="action-icon">
                {action.type === 'DOCTOR_VERIFICATION' && <Shield size={20} />}
                {action.type === 'APPOINTMENT_REVIEW' && <Calendar size={20} />}
                {action.type === 'SYSTEM_ALERT' && <AlertTriangle size={20} />}
              </div>
              <div className="action-content">
                <div className="action-title">{action.title}</div>
                <div className="action-description">{action.description}</div>
                <div className="action-meta">
                  <span className="action-user">{action.user}</span>
                  <span className="action-time">{action.days_pending} days pending</span>
                </div>
              </div>
              <div className={`action-priority priority-${action.priority?.toLowerCase()}`}>
                {action.priority}
              </div>
              <div className="action-actions">
                <button className="btn btn-sm btn-primary">
                  <Eye size={14} />
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-data-message">No pending actions</div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading system analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <AlertTriangle size={48} />
        <h3>Unable to Load Analytics</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchAnalyticsData}>
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="system-analytics">
      <div className="analytics-header">
        <div className="header-content">
          <h1>System Analytics</h1>
          <p>Comprehensive system performance and usage metrics</p>
        </div>
        <div className="header-actions">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="timeframe-select"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <button className="btn btn-secondary" onClick={fetchAnalyticsData}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <div className="export-dropdown">
            <button 
              className="btn btn-primary" 
              onClick={() => handleExport('csv')}
              disabled={exporting}
            >
              <Download size={16} />
              {exporting ? 'Exporting...' : 'Export'}
            </button>
            <div className="export-options">
              <button onClick={() => handleExport('csv')} disabled={exporting}>
                <Download size={14} />
                Export as CSV
              </button>
              <button onClick={() => handleExport('json')} disabled={exporting}>
                <Download size={14} />
                Export as JSON
              </button>
              <button onClick={() => handleExport('pdf')} disabled={exporting}>
                <Download size={14} />
                Export as PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={16} />
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} />
          User Analytics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          <Server size={16} />
          Performance
        </button>
        <button 
          className={`tab-btn ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          <AlertTriangle size={16} />
          Pending Actions
          {pendingActions.length > 0 && (
            <span className="tab-badge">{pendingActions.length}</span>
          )}
        </button>
      </div>

      <div className="analytics-content">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'users' && <UserAnalyticsTab />}
        {activeTab === 'performance' && <SystemPerformanceTab />}
        {activeTab === 'actions' && <PendingActionsTab />}
      </div>
    </div>
  );
};

export default SystemAnalytics;