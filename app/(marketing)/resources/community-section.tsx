'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Github, Twitter, ArrowRight, ExternalLink } from 'lucide-react';

const communityLinks = [
  {
    title: "Discord Community",
    description: "Join 10,000+ developers discussing deployments, sharing tips, and helping each other.",
    href: "https://discord.gg/ovmon",
    icon: MessageSquare,
    members: "10,000+",
    color: "bg-[#5865F2]/20 text-[#5865F2]",
    external: true,
  },
  {
    title: "GitHub Discussions",
    description: "Report issues, request features, and contribute to the Ovmon ecosystem.",
    href: "https://github.com/ovmon",
    icon: Github,
    members: "5,000+",
    color: "bg-foreground/10 text-foreground",
    external: true,
  },
  {
    title: "Twitter / X",
    description: "Follow us for the latest updates, tips, and community highlights.",
    href: "https://twitter.com/ovmon",
    icon: Twitter,
    members: "25,000+",
    color: "bg-foreground/10 text-foreground",
    external: true,
  },
];

const communityStats = [
  { value: "50,000+", label: "Active developers" },
  { value: "1,000+", label: "Questions answered daily" },
  { value: "500+", label: "Community contributors" },
];

export function CommunitySection() {
  return (
    <section className="py-16 lg:py-24 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
            Community
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
            Join the community
          </h2>
          <p className="text-foreground/60 max-w-2xl mx-auto">
            Connect with other developers, get help, and share your knowledge.
          </p>
        </div>

        {/* Community Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-12"
        >
          {communityStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl lg:text-3xl font-bold text-accent mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Community Links */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {communityLinks.map((link, i) => (
            <motion.div
              key={link.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <Link
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
              >
                <Card className="h-full bg-card hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${link.color} flex items-center justify-center`}>
                        <link.icon className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {link.members}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors flex items-center gap-2">
                      {link.title}
                      {link.external && <ExternalLink className="w-4 h-4 text-muted-foreground" />}
                    </h3>
                    <p className="text-sm text-foreground/60 leading-relaxed">
                      {link.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Additional CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <Button variant="outline" className="group" asChild>
            <Link href="/community">
              Explore all community resources
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
