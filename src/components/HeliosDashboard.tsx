import React from 'react';
import { Zap, ExternalLink, Activity } from 'lucide-react';
import TickerTape from './TickerTape';
import { HeliosTradingTerminal } from './trading/HeliosTradingTerminal';

const HeliosDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 safe-area-bottom">
      {/* TradingView Ticker Tape */}
      <div className="bg-gray-800 border-b border-gray-700">
        <TickerTape />
      </div>
      
      {/* New Helios Trading Terminal with Redirect */}
      <div className="p-4">
        <HeliosTradingTerminal />
      </div>
    </div>
  );
};

export default HeliosDashboard;