import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import LoginModal from "@/components/auth/login-modal";
import RegisterModal from "@/components/auth/register-modal";
import { PlayCircle, Building, User, Coins, Video, Download, ChartLine, Eye, Sliders, Clock, 
  Check, ArrowRight, ArrowUp, Twitter, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

export default function LandingPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registrationType, setRegistrationType] = useState<'company' | 'individual' | null>(null);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
  };

  const openRegisterModal = (type: 'company' | 'individual') => {
    setRegistrationType(type);
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-primary flex items-center">
                <PlayCircle className="mr-2" />
                AdVidly
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-800 hover:text-primary font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-800 hover:text-primary font-medium">How It Works</a>
              <a href="#pricing" className="text-gray-800 hover:text-primary font-medium">Pricing</a>
              <a href="#contact" className="text-gray-800 hover:text-primary font-medium">Contact</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="text-primary"
                onClick={() => openLoginModal()}
              >
                Log In
              </Button>
              <Button 
                onClick={() => openRegisterModal('individual')}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-green-500/10 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Advertise Smarter, Create Faster</h1>
              <p className="text-lg mb-6">The platform where companies run ads at competitive rates and creators integrate them into their videos for any platform.</p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button 
                  onClick={() => openRegisterModal('company')}
                  className="bg-green-500 hover:bg-green-600 px-6 py-3"
                >
                  <Building className="mr-2 h-5 w-5" />
                  Register as Company
                </Button>
                <Button 
                  onClick={() => openRegisterModal('individual')}
                  className="bg-amber-500 hover:bg-amber-600 px-6 py-3"
                >
                  <User className="mr-2 h-5 w-5" />
                  Register as Creator
                </Button>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative">
                <div className="bg-white p-2 rounded-lg shadow-lg">
                  <div className="aspect-w-16 aspect-h-9 bg-black rounded-md overflow-hidden relative">
                    <img 
                      src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" 
                      alt="Video creation process" 
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button className="w-16 h-16 bg-primary/75 rounded-full flex items-center justify-center">
                        <PlayCircle className="h-10 w-10 text-white" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white p-2 rounded-md shadow-md">
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="text-primary" />
                    <span>Process videos in minutes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose AdVidly?</h2>
            <p className="text-lg max-w-2xl mx-auto">Our platform connects companies with creators for seamless ad integration at competitive rates.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-primary text-4xl mb-4">
                <Coins className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold mb-2">Lower Ad Rates</h3>
              <p>Companies enjoy significantly lower advertising rates compared to direct YouTube advertising.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-amber-500 text-4xl mb-4">
                <Video className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Ad Integration</h3>
              <p>Our system intelligently places ads in videos for natural integration that engages viewers.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-green-500 text-4xl mb-4">
                <Download className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold mb-2">Easy Download & Share</h3>
              <p>Creators can download processed videos and publish them anywhere - YouTube, TikTok, Instagram, etc.</p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-primary text-4xl mb-4">
                <ChartLine className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold mb-2">Performance Analytics</h3>
              <p>Both companies and creators get detailed analytics on ad performance and viewer engagement.</p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-amber-500 text-4xl mb-4">
                <Eye className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold mb-2">Preview Before Publishing</h3>
              <p>Check how ads will appear in your content before finalizing with our advanced preview system.</p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-green-500 text-4xl mb-4">
                <Sliders className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold mb-2">Customization Options</h3>
              <p>Set preferences for ad placement, style, and integration to match your content's style.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg max-w-2xl mx-auto">Simple, efficient, and effective for both companies and creators.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-green-500 mb-2">For Companies</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center mr-3 mt-1">1</div>
                    <div>
                      <h4 className="font-medium">Register your company</h4>
                      <p className="text-gray-600">Create an account and provide details about your business.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center mr-3 mt-1">2</div>
                    <div>
                      <h4 className="font-medium">Upload your ads</h4>
                      <p className="text-gray-600">Add your advertising content and set targeting preferences.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center mr-3 mt-1">3</div>
                    <div>
                      <h4 className="font-medium">Set your budget</h4>
                      <p className="text-gray-600">Choose how much you want to spend and track performance.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center mr-3 mt-1">4</div>
                    <div>
                      <h4 className="font-medium">Review analytics</h4>
                      <p className="text-gray-600">Monitor how your ads are performing across different videos.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            <div>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-amber-500 mb-2">For Creators</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-500 text-white flex items-center justify-center mr-3 mt-1">1</div>
                    <div>
                      <h4 className="font-medium">Sign up as a creator</h4>
                      <p className="text-gray-600">Create your profile and specify your content niche.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-500 text-white flex items-center justify-center mr-3 mt-1">2</div>
                    <div>
                      <h4 className="font-medium">Upload your video</h4>
                      <p className="text-gray-600">Upload your content and choose ad preferences.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-500 text-white flex items-center justify-center mr-3 mt-1">3</div>
                    <div>
                      <h4 className="font-medium">Preview and approve</h4>
                      <p className="text-gray-600">See how ads will appear in your video and approve the final result.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-500 text-white flex items-center justify-center mr-3 mt-1">4</div>
                    <div>
                      <h4 className="font-medium">Download and publish</h4>
                      <p className="text-gray-600">Get your processed video and publish it on any platform.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Transparent Pricing</h2>
            <p className="text-lg max-w-2xl mx-auto">Affordable options for companies of all sizes and free for creators.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Company Pricing */}
            <div className="col-span-1 lg:col-span-2">
              <h3 className="text-xl font-bold text-green-500 mb-4">For Companies</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Basic Plan */}
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-bold mb-2">Starter</h4>
                  <div className="text-3xl font-bold mb-1">$99<span className="text-sm font-normal">/month</span></div>
                  <p className="text-gray-600 mb-4">Perfect for small businesses</p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-5 w-5" />
                      <span>5 active ad campaigns</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-5 w-5" />
                      <span>Basic targeting options</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-5 w-5" />
                      <span>Standard analytics</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-5 w-5" />
                      <span>Email support</span>
                    </li>
                  </ul>
                  <Button 
                    onClick={() => openRegisterModal('company')}
                    className="w-full bg-green-500 hover:bg-green-600">
                    Get Started
                  </Button>
                </div>
                
                {/* Pro Plan */}
                <div className="border-2 border-primary rounded-lg p-6 bg-gray-50 relative shadow-md">
                  <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 transform translate-x-2 -translate-y-2 rounded">POPULAR</div>
                  <h4 className="text-lg font-bold mb-2">Professional</h4>
                  <div className="text-3xl font-bold mb-1">$249<span className="text-sm font-normal">/month</span></div>
                  <p className="text-gray-600 mb-4">For growing businesses</p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center">
                      <Check className="text-primary mr-2 h-5 w-5" />
                      <span>15 active ad campaigns</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="text-primary mr-2 h-5 w-5" />
                      <span>Advanced targeting</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="text-primary mr-2 h-5 w-5" />
                      <span>Detailed analytics</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="text-primary mr-2 h-5 w-5" />
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="text-primary mr-2 h-5 w-5" />
                      <span>Custom ad formats</span>
                    </li>
                  </ul>
                  <Button 
                    onClick={() => openRegisterModal('company')}
                    className="w-full">
                    Get Started
                  </Button>
                </div>
                
                {/* Enterprise Plan */}
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-bold mb-2">Enterprise</h4>
                  <div className="text-3xl font-bold mb-1">$599<span className="text-sm font-normal">/month</span></div>
                  <p className="text-gray-600 mb-4">For large organizations</p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-5 w-5" />
                      <span>Unlimited ad campaigns</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-5 w-5" />
                      <span>Premium targeting</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-5 w-5" />
                      <span>Advanced analytics</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-5 w-5" />
                      <span>Dedicated account manager</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-5 w-5" />
                      <span>API access</span>
                    </li>
                  </ul>
                  <Button 
                    onClick={() => openRegisterModal('company')}
                    className="w-full bg-green-500 hover:bg-green-600">
                    Contact Sales
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Creator Pricing */}
            <div className="col-span-1">
              <h3 className="text-xl font-bold text-amber-500 mb-4">For Creators</h3>
              <div className="border-2 border-amber-500 rounded-lg p-6 bg-gray-50 h-full">
                <h4 className="text-lg font-bold mb-2">Creator Account</h4>
                <div className="text-3xl font-bold mb-1">Free</div>
                <p className="text-gray-600 mb-4">No monthly fees, ever</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <Check className="text-amber-500 mr-2 h-5 w-5" />
                    <span>Unlimited video uploads</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-amber-500 mr-2 h-5 w-5" />
                    <span>Ad integration tools</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-amber-500 mr-2 h-5 w-5" />
                    <span>Performance tracking</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-amber-500 mr-2 h-5 w-5" />
                    <span>HD downloads</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-amber-500 mr-2 h-5 w-5" />
                    <span>Standard support</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => openRegisterModal('individual')}
                  className="w-full bg-amber-500 hover:bg-amber-600">
                  Sign Up Free
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Ready to Transform Your Video Strategy?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">Join thousands of companies and creators already benefiting from our platform.</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button 
              onClick={() => openRegisterModal('company')}
              className="bg-white text-primary hover:bg-gray-100 px-8 py-3">
              <Building className="mr-2 h-5 w-5" />
              For Companies
            </Button>
            <Button 
              onClick={() => openRegisterModal('individual')}
              className="bg-amber-500 text-white hover:bg-amber-600 px-8 py-3">
              <User className="mr-2 h-5 w-5" />
              For Creators
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4 flex items-center">
                <PlayCircle className="mr-2" />
                AdVidly
              </div>
              <p className="mb-4">Transforming how companies advertise and creators monetize videos.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-white hover:text-primary"><Twitter size={20} /></a>
                <a href="#" className="text-white hover:text-primary"><Facebook size={20} /></a>
                <a href="#" className="text-white hover:text-primary"><Instagram size={20} /></a>
                <a href="#" className="text-white hover:text-primary"><Linkedin size={20} /></a>
                <a href="#" className="text-white hover:text-primary"><Youtube size={20} /></a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Press</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">API</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Copyright</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center md:text-left md:flex md:justify-between">
            <p>© 2023 AdVidly. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Design by <a href="#" className="text-primary">AdVidly Team</a></p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onRegisterClick={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />
      
      <RegisterModal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)}
        initialUserType={registrationType}
        onLoginClick={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </div>
  );
}
