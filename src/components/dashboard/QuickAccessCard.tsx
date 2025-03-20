
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Glass } from '@/components/ui/Glass';

interface QuickAccessItem {
  title: string;
  description: string;
  icon: string;
  linkTo: string;
}

interface QuickAccessCardProps {
  items: QuickAccessItem[];
}

export const QuickAccessCard: React.FC<QuickAccessCardProps> = ({ items }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acesso Rápido</CardTitle>
        <CardDescription>
          Ações comuns para gerenciar sua fazenda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <Link to={item.linkTo} className="block" key={index}>
            <Glass hover={true} className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <i className={`${item.icon} text-primary`}></i>
                </div>
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-mono-500">{item.description}</div>
                </div>
              </div>
            </Glass>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
};
