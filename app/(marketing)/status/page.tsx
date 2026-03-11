import { MarketingLayout } from '@/components/marketing/marketing-layout';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

export const metadata = {
  title: 'Status Page - Ovmon',
  description: 'Real-time status of Ovmon services and infrastructure.'
};

export default function StatusPage() {
  const currentStatus = 'operational';
  
  const services = [
    { name: 'API', status: 'operational', uptime: '99.99%' },
    { name: 'Dashboard', status: 'operational', uptime: '99.98%' },
    { name: 'Webhooks', status: 'operational', uptime: '99.99%' },
    { name: 'Database', status: 'operational', uptime: '99.99%' },
    { name: 'CDN', status: 'operational', uptime: '99.95%' },
    { name: 'Email Notifications', status: 'operational', uptime: '99.97%' }
  ];

  const incidents = [
    {
      title: 'Dashboard Performance Degradation',
      status: 'resolved',
      date: 'March 10, 2024',
      duration: '45 minutes',
      description: 'Some users experienced slower dashboard loading times. Issue was resolved by scaling up database capacity.'
    },
    {
      title: 'Email Notifications Delay',
      status: 'resolved',
      date: 'March 5, 2024',
      duration: '2 hours',
      description: 'Transient email delivery delays affecting some notifications. Resolved by rebalancing message queue.'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className={`w-5 h-5 ${getStatusColor(status)}`} />;
      case 'degraded':
        return <AlertCircle className={`w-5 h-5 ${getStatusColor(status)}`} />;
      case 'resolved':
        return <Clock className={`w-5 h-5 ${getStatusColor(status)}`} />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <MarketingLayout
      title="System Status"
      description="Real-time status of Ovmon services and infrastructure"
      showBackButton={false}
    >
      {/* Current Status */}
      <section className="space-y-4 p-8 rounded-lg border border-border bg-secondary/50">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <h2 className="text-2xl font-bold">All Systems Operational</h2>
        </div>
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            month: 'short',
            day: 'numeric'
          })}
        </p>
      </section>

      {/* Services Status */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Service Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-border bg-secondary/50 flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold flex items-center gap-2">
                  {getStatusIcon(service.status)}
                  {service.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  30-day uptime: <span className="font-semibold text-foreground">{service.uptime}</span>
                </p>
              </div>
              <span className={`text-sm font-semibold capitalize ${getStatusColor(service.status)}`}>
                {service.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Incidents */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Recent Incidents</h2>
        <div className="space-y-4">
          {incidents.map((incident, idx) => (
            <div key={idx} className="p-6 rounded-lg border border-border bg-secondary/50 space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold">{incident.title}</h3>
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-xs font-semibold capitalize">
                  {incident.status}
                </span>
              </div>
              <p className="text-muted-foreground text-sm">{incident.description}</p>
              <div className="flex flex-col md:flex-row md:items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
                <span>{incident.date}</span>
                <span className="hidden md:inline">•</span>
                <span>Duration: {incident.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Uptime History */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">90-Day Uptime</h2>
        <div className="p-6 rounded-lg border border-border bg-secondary/50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Overall System Uptime</span>
              <span className="text-2xl font-bold text-accent">99.98%</span>
            </div>
            <div className="w-full bg-background rounded h-2 overflow-hidden">
              <div className="bg-green-500 h-full" style={{ width: '99.98%' }} />
            </div>
            <p className="text-xs text-muted-foreground">
              This is the combined uptime across all our services over the last 90 days.
            </p>
          </div>
        </div>
      </section>

      {/* Status Page Explanation */}
      <section className="space-y-4 p-6 rounded-lg border border-border bg-secondary/30">
        <h2 className="text-2xl font-bold">Status Definitions</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div>
            <span className="font-semibold text-foreground">Operational:</span> Service is functioning normally
          </div>
          <div>
            <span className="font-semibold text-foreground">Degraded:</span> Service is available but experiencing performance issues
          </div>
          <div>
            <span className="font-semibold text-foreground">Down:</span> Service is unavailable
          </div>
          <div>
            <span className="font-semibold text-foreground">Maintenance:</span> Service is undergoing planned maintenance
          </div>
        </div>
      </section>

      {/* Notification */}
      <section className="space-y-4 p-6 rounded-lg border border-border bg-secondary/50">
        <h2 className="text-2xl font-bold">Get Notifications</h2>
        <p className="text-muted-foreground">
          Subscribe to status updates and get notified instantly when incidents occur.
        </p>
        <div className="flex gap-3 pt-2">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:border-accent"
          />
          <button className="px-6 py-2 bg-accent text-background rounded-md hover:bg-accent/90 transition-colors font-medium">
            Subscribe
          </button>
        </div>
      </section>
    </MarketingLayout>
  );
}
