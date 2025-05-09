"use client";

import Link from "next/link";
import { Vote } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Vote className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">TheBallotProject</span>
            </div>
            <p className="text-sm text-gray-400">
              Simplify your electoral processes with our innovative platform.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-200">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-gray-400 hover:text-primary">Features</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-primary">Pricing</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-primary">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-200">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-gray-400 hover:text-primary">About Us</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-primary">Blog</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-primary">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-200">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-gray-400 hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-primary">Terms of Service</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-primary">Cookies</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-8 pt-8 pb-10 text-center text-sm text-gray-400">
        © 2025 LaForge – TheBallotProject. All rights reserved.
      </div>
    </footer>
  );
}
