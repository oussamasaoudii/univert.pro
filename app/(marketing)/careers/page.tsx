import { MarketingLayout } from '@/components/marketing/marketing-layout';
import { Briefcase, MapPin, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Careers - Join Ovmon',
  description: 'Join our team and help shape the future of web hosting.'
};

export default function CareersPage() {
  const openPositions = [
    {
      title: 'Senior Full-Stack Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'Full-time'
    },
    {
      title: 'DevOps Engineer',
      department: 'Infrastructure',
      location: 'San Francisco, CA',
      type: 'Full-time'
    },
    {
      title: 'Product Manager',
      department: 'Product',
      location: 'Remote',
      type: 'Full-time'
    },
    {
      title: 'Customer Success Manager',
      department: 'Customer Success',
      location: 'Remote',
      type: 'Full-time'
    },
    {
      title: 'Design Lead',
      department: 'Design',
      location: 'San Francisco, CA',
      type: 'Full-time'
    },
    {
      title: 'Sales Representative',
      department: 'Sales',
      location: 'Remote',
      type: 'Full-time'
    }
  ];

  const benefits = [
    { icon: TrendingUp, title: 'Growth Opportunities', desc: 'Learn from industry experts and grow your skills' },
    { icon: Users, title: 'Collaborative Culture', desc: 'Work with talented people who care about quality' },
    { icon: Briefcase, title: 'Competitive Compensation', desc: 'Salary, equity, and benefits that reflect your value' },
    { icon: MapPin, title: 'Flexibility', desc: 'Work remotely or from our SF office' }
  ];

  return (
    <MarketingLayout
      title="Join Our Team"
      description="Help us build the future of web hosting"
    >
      {/* Why Join Section */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Why Join Ovmon?</h2>
        <p className="text-muted-foreground leading-relaxed">
          At Ovmon, we're building the next generation of web hosting infrastructure. We're a fast-growing team of
          engineers, designers, and product specialists who are passionate about solving hard infrastructure problems.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div key={idx} className="p-6 rounded-lg border border-border bg-secondary/50">
                <Icon className="w-8 h-8 text-accent mb-3" />
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Culture Section */}
      <section className="space-y-4 p-6 rounded-lg border border-border bg-secondary/50">
        <h2 className="text-2xl font-bold">Our Culture</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We believe in shipping fast, learning quickly, and maintaining quality. Our culture is built on:
        </p>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
            <span><strong>Autonomy:</strong> We trust our team to make decisions and take ownership of their work.</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
            <span><strong>Transparency:</strong> Communication is key. We share wins and challenges openly.</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
            <span><strong>Excellence:</strong> We set high standards and support each other in achieving them.</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
            <span><strong>Impact:</strong> Your work directly affects thousands of users and businesses.</span>
          </li>
        </ul>
      </section>

      {/* Open Positions */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Open Positions</h2>
        <div className="space-y-4">
          {openPositions.map((position, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg border border-border bg-secondary/50 hover:bg-secondary hover:border-accent transition-colors flex items-start justify-between group"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-accent transition-colors">{position.title}</h3>
                <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm text-muted-foreground">
                  <span>{position.department}</span>
                  <span className="hidden md:inline">•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {position.location}
                  </span>
                  <span className="hidden md:inline">•</span>
                  <span>{position.type}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="ml-4 flex-shrink-0">
                Apply
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">What We Offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          {[
            'Competitive salary and equity',
            'Health insurance (medical, dental, vision)',
            'Generous PTO policy',
            '401(k) matching',
            'Remote-first or SF office flexibility',
            'Professional development budget',
            'Parental leave',
            'Wellness program',
            'Free lunch and snacks',
            'Home office stipend',
            'Conference attendance',
            'Team events and outings'
          ].map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
              <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
              {benefit}
            </div>
          ))}
        </div>
      </section>

      {/* Hiring Process */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Our Hiring Process</h2>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Application', desc: 'Submit your resume and cover letter' },
            { step: '2', title: 'Screening Call', desc: 'Chat with our recruiter (15-20 min)' },
            { step: '3', title: 'Technical Interview', desc: 'Discuss your experience and skills' },
            { step: '4', title: 'Team Interview', desc: 'Meet the team and discuss the role' },
            { step: '5', title: 'Offer', desc: 'Receive an offer and negotiate terms' }
          ].map((item, idx) => (
            <div key={idx} className="flex gap-4 p-4 rounded-lg border border-border bg-secondary/50">
              <div className="w-8 h-8 rounded-full bg-accent text-background flex items-center justify-center font-semibold flex-shrink-0">
                {item.step}
              </div>
              <div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Diversity Statement */}
      <section className="space-y-4 p-6 rounded-lg border border-border bg-secondary/50">
        <h2 className="text-2xl font-bold">Diversity & Inclusion</h2>
        <p className="text-muted-foreground">
          We're committed to building a diverse and inclusive workplace. We actively encourage applications from people
          of all backgrounds and are happy to discuss accommodations and flexibility.
        </p>
      </section>

      {/* CTA */}
      <section className="space-y-4 p-6 rounded-lg border border-border bg-secondary/30">
        <h2 className="text-2xl font-bold">Ready to Join Us?</h2>
        <p className="text-muted-foreground">
          Have questions? Reach out to our team at{' '}
          <a href="mailto:careers@ovmon.com" className="text-accent hover:underline">
            careers@ovmon.com
          </a>
        </p>
        <Button className="mt-4">View All Jobs</Button>
      </section>
    </MarketingLayout>
  );
}
