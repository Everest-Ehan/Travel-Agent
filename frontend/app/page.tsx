'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './contexts/AuthContext'
import UserProfile from './components/auth/UserProfile'
import EmailVerificationBanner from './components/auth/EmailVerificationBanner'
import { ApiService } from './services/api'

// Debug: Check if ApiService is imported correctly
console.log('🔧 ApiService imported:', typeof ApiService);
console.log('🔧 ApiService.fetchFeaturedHotels:', typeof ApiService.fetchFeaturedHotels);

export default function Home() {
  console.log('🏠 Home component rendering...');
  
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [featuredHotels, setFeaturedHotels] = useState<any[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    console.log('🏠 HOME PAGE - useEffect triggered - component mounted');
    console.log('🏠 HOME PAGE - Current loadingFeatured state:', loadingFeatured);
    console.log('🏠 HOME PAGE - Current featuredHotels state:', featuredHotels);
    
    const fetchFeaturedHotels = async () => {
      console.log('🏠 HOME PAGE - 🚀 Starting to fetch featured hotels...');
      console.log('🏠 HOME PAGE - ApiService available:', typeof ApiService);
      console.log('🏠 HOME PAGE - fetchFeaturedHotels method available:', typeof ApiService.fetchFeaturedHotels);
      
      try {
        console.log('🏠 HOME PAGE - 📞 About to call ApiService.fetchFeaturedHotels()...');
        const hotels = await ApiService.fetchFeaturedHotels();
        console.log('🏠 HOME PAGE - ✅ API call completed! Response received:');
        console.log('🏠 HOME PAGE - ✅ FULL API RESPONSE:', JSON.stringify(hotels, null, 2));
        console.log('🏠 HOME PAGE - ✅ Hotels array:', hotels);
        console.log('🏠 HOME PAGE - ✅ Number of hotels received:', hotels ? hotels.length : 'null/undefined');
        
        if (hotels && hotels.length > 0) {
          console.log('🏠 HOME PAGE - ✅ First hotel details:');
          console.log('🏠 HOME PAGE - ✅ Hotel ID:', hotels[0].id);
          console.log('🏠 HOME PAGE - ✅ Hotel Name:', hotels[0].name);
          console.log('🏠 HOME PAGE - ✅ Hotel City:', hotels[0].physical_city);
          console.log('🏠 HOME PAGE - ✅ Hotel Country:', hotels[0].physical_country);
        }
        
        console.log('🏠 HOME PAGE - 🔄 Setting hotels to state...');
        setFeaturedHotels(hotels);
        console.log('🏠 HOME PAGE - ✅ Featured hotels state updated with', hotels ? hotels.length : 0, 'hotels');
        
      } catch (error) {
        console.error('🏠 HOME PAGE - ❌ ERROR in fetching featured hotels:', error);
        console.error('🏠 HOME PAGE - ❌ Error type:', typeof error);
        console.error('🏠 HOME PAGE - ❌ Error details:', error);
        // Fallback to empty array if API fails
        setFeaturedHotels([]);
        console.log('🏠 HOME PAGE - ✅ Set empty array as fallback due to error');
      } finally {
        console.log('🏠 HOME PAGE - 🔄 Setting loading to false...');
        setLoadingFeatured(false);
        console.log('🏠 HOME PAGE - ✅ Loading state set to false');
      }
    };

    console.log('🏠 HOME PAGE - 🔄 About to call fetchFeaturedHotels immediately...');
    // Call the function immediately
    fetchFeaturedHotels();
    
    // Also add a timeout to ensure it gets called
    const timeoutId = setTimeout(() => {
      console.log('🏠 HOME PAGE - ⏰ Timeout triggered - calling fetchFeaturedHotels again as backup');
      fetchFeaturedHotels();
    }, 2000);

    return () => {
      console.log('🏠 HOME PAGE - 🧹 Cleanup: clearing timeout');
      clearTimeout(timeoutId);
    };
  }, []);

  const handleSearchClick = () => {
    router.push('/search');
  };

  const handleFindHotelClick = () => {
    router.push('/dashboard');
  };

  const handleViewAllBlogsClick = () => {
    console.log('View all blogs clicked');
  };

  const handleDiscoverMoreClick = () => {
    router.push('/dashboard');
  };



  return (
    <div className="bg-white relative min-h-screen">
      {/* Email Verification Banner */}
      <EmailVerificationBanner />
       

      
             {/* Background Image with Gradient Overlay */}
               <div 
          className="absolute bg-gradient-to-b from-transparent to-black/30 h-[713px] left-0 top-0 w-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/hero-bg.jpg')"
          }}
        />
      
      {/* Header */}
      <header className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
        {/* Debug info */}
        <div style={{ position: 'absolute', top: '-30px', left: '0', color: 'white', fontSize: '12px', zIndex: 100 }}>
          Debug: authLoading={authLoading.toString()}, user={user ? 'logged in' : 'not logged in'}
        </div>
        <div className="bg-black/20 backdrop-blur-sm rounded-[50px] px-8 py-3 flex items-center justify-between w-[1269px]">
          <div className="text-white text-3xl font-extrabold">LOGO</div>
          <nav className="flex items-center gap-15 text-white text-base font-semibold">
            <a href="#" className="hover:text-gray-200">Find Hotel</a>
            <a href="#" className="hover:text-gray-200">Status Search</a>
            <a href="#" className="hover:text-gray-200">Download Mobile App</a>
            </nav>
          <div className="flex items-center gap-5">
              {/* Debug rendering */}
              <div style={{ color: 'white', fontSize: '10px', marginRight: '10px' }}>
                Loading: {authLoading.toString()}, User: {user ? 'Yes' : 'No'}
              </div>
              {authLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : user ? (
                <UserProfile />
              ) : (
                <button
                  className="bg-[#57b3ca] text-white px-8 py-2 rounded-[23px] text-sm font-semibold hover:bg-[#4a9bb0] transition-colors cursor-pointer relative z-50"
                  style={{ pointerEvents: 'auto' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔐 Login/Signup button clicked!');
                    try {
                      router.push('/auth');
                    } catch (error) {
                      console.error('🔐 Navigation error:', error);
                      // Fallback to window.location if router fails
                      window.location.href = '/auth';
                    }
                  }}
                  onMouseDown={(e) => {
                    console.log('🔐 Button mouse down event');
                  }}
                  onMouseUp={(e) => {
                    console.log('🔐 Button mouse up event');
                  }}
                > 
                  Login / Signup
                </button>
              )}
              {/* Test button - always visible */}
             
            <div className="bg-white rounded-[23px] w-[98px] h-[46px] flex items-center justify-center">
              <div className="w-6 h-6 text-gray-600">
                <svg fill="currentColor" viewBox="0 0 20 15">
                  <path d="M0 1C0 0.734784 0.105357 0.48043 0.292893 0.292893C0.48043 0.105357 0.734784 0 1 0H19C19.2652 0 19.5196 0.105357 19.7071 0.292893C19.8946 0.48043 20 0.734784 20 1C20 1.26522 19.8946 1.51957 19.7071 1.70711C19.5196 1.89464 19.2652 2 19 2H1C0.734784 2 0.48043 1.89464 0.292893 1.70711C0.105357 1.51957 0 1.26522 0 1V1Z"/>
                  <path d="M0 7.032C0 6.76678 0.105357 6.51243 0.292893 6.32489C0.48043 6.13736 0.734784 6.032 1 6.032H19C19.2652 6.032 19.5196 6.13736 19.7071 6.32489C19.8946 6.51243 20 6.76678 20 7.032C20 7.29722 19.8946 7.55157 19.7071 7.73911C19.5196 7.92664 19.2652 8.032 19 8.032H1C0.734784 8.032 0.48043 7.92664 0.292893 7.73911C0.105357 7.55157 0 7.29722 0 7.032V7.032Z"/>
                  <path d="M1 12.064C0.734784 12.064 0.48043 12.1694 0.292893 12.3569C0.105357 12.5444 0 12.7988 0 13.064C0 13.3292 0.105357 13.5836 0.292893 13.7711C0.48043 13.9586 0.734784 14.064 1 14.064H19C19.2652 14.064 19.5196 13.9586 19.7071 13.7711C19.8946 13.5836 20 13.3292 20 13.064C20 12.7988 19.8946 12.5444 19.7071 12.3569C19.5196 12.1694 19.2652 12.064 19 12.064H1Z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Search Overlay */}
      <section className="relative z-10 pt-48 text-center pb-40">
        <h1 className="text-white text-6xl font-semibold mb-8 max-w-4xl mx-auto">
          Lorem ipsum dolor sit amet consectetur.
        </h1>
        <p className="text-white text-2xl max-w-4xl mx-auto leading-relaxed">
          Lorem ipsum dolor sit amet consectetur. Consequat fusce ac non
          vestibulum morbi turpis facilisi suscipit. Ipsum mauris feugiat arcu
          rhoncus vestibulum nunc vulputate semper feugiat.
          </p>
          
        {/* Search Section - Positioned to overlap with hero image */}
        <div className="absolute -bottom-44 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-white rounded-bl-[100px] rounded-tl-[100px] shadow-lg p-5 pt-12 pb-5 px-20 w-[1360px]">
          <div className="flex items-center gap-11">
            {/* Location Field */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2 opacity-60">
                <div className="w-6 h-6 opacity-30">
                  <svg fill="currentColor" viewBox="0 0 14 16">
                    <path d="M7 0C10.866 0 14 3.13401 14 7C14 12.0159 8.88192 15.0342 7.39844 15.8037C7.14557 15.9349 6.85443 15.9349 6.60156 15.8037C5.11808 15.0342 0 12.0159 0 7C0 3.13401 3.13401 0 7 0ZM7 4C5.34315 4 4 5.34315 4 7C4 8.65685 5.34315 10 7 10C8.65685 10 10 8.65685 10 7C10 5.34315 8.65685 4 7 4Z"/>
                      </svg>
                  </div>
                <span className="text-lg text-black">Location</span>
                    </div>
              <div className="text-2xl font-medium text-[#121212] mb-2">Jammu & Kashmir</div>
              <div className="text-lg opacity-30 text-[#121212]">Jammu district</div>
                  </div>
                  
            {/* Guests Field */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2 opacity-60">
                <div className="w-6 h-6 opacity-30">
                  <svg fill="currentColor" viewBox="0 0 18 18">
                    <path d="M9 0C10.6569 0 12 1.34315 12 3C12 4.65685 10.6569 6 9 6C7.34315 6 6 4.65685 6 3C6 1.34315 7.34315 0 9 0ZM9 8C6.79086 8 5 9.79086 5 12V15H13V12C13 9.79086 11.2091 8 9 8Z"/>
                      </svg>
                </div>
                <span className="text-lg text-black">Guests</span>
                    </div>
              <div className="text-2xl font-medium text-[#121212] mb-2">3 Person</div>
              <div className="text-lg opacity-30 text-[#121212]">2 Adult, 1 Child</div>
                  </div>
                  
            {/* Check-in Field */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2 opacity-60">
                <div className="w-6 h-6 opacity-30">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 6.5L12 10.5M18 13C19.1046 13 20 13.8954 20 15V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V15C4 13.8954 4.89543 13 6 13H11V16.0859L8 13.0859L6.58594 14.5L12 19.9141L17.4141 14.5L16 13.0859L13 16.0859V13H18Z"/>
                        </svg>
                </div>
                <span className="text-lg text-black">Check-in</span>
              </div>
              <div className="text-2xl font-medium text-[#121212] mb-2">24 July 2022</div>
              <div className="text-lg opacity-30 text-[#121212]">Select date</div>
              </div>
              
            {/* Check-out Field */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2 opacity-60">
                <div className="w-6 h-6 opacity-30">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.5L12 13.5M6 11C4.89543 11 4 11.8954 4 13V17C4 18.1046 4.89543 19 6 19H18C19.1046 19 20 18.1046 20 17V13C20 11.8954 19.1046 11 18 11H13V7.91406L16 10.9141L17.4141 9.5L12 4.08594L6.58594 9.5L8 10.9141L11 7.91406V11H6Z"/>
                      </svg>
                </div>
                <span className="text-lg text-black">Check-out</span>
              </div>
              <div className="text-2xl font-medium text-[#121212] mb-2">28 July 2022</div>
              <div className="text-lg opacity-30 text-[#121212]">Select date</div>
            </div>

            {/* Search Button */}
            <button 
              onClick={handleSearchClick}
              className="bg-[#57b3ca] text-white rounded-full w-[113px] h-[113px] flex flex-col items-center justify-center hover:bg-[#4a9bb0] transition-colors"
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm">search</span>
            </button>
          </div>
        </div>
            </div>
      </section>

                    {/* Top Rated Hotels Section */}
       <section className="pt-64 pb-24 px-4">
         <div className="max-w-[1269px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#2e2e2e] mb-6">Top Rated Hotels</h2>
            <div className="bg-[#57b3ca] h-1.5 w-36 mx-auto rounded"></div>
          </div>
          
          <div className="grid grid-cols-4 gap-8">
            {[
              { name: 'The St. Regis Atlanta', location: 'Atlanta, GA' },
              { name: 'Montage Beverly Hills', location: 'Beverly Hills, CA' },
              { name: 'St. Regis Washington, D.C.', location: 'Washington, D.C.' },
              { name: 'Bellagio', location: 'Las Vegas, NV' }
            ].map((hotel, index) => (
              <div key={index} className="relative group cursor-pointer">
                <div className="h-[340px] bg-gray-200 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-3 right-3 w-6 h-6 opacity-30">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
              </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg mb-1">{hotel.name}</h3>
                  <p className="text-white/80 text-sm">{hotel.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

                    {/* Featured Hotels Section */}
       <section className="py-24 px-4 bg-gray-50">
         <div className="max-w-[1269px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#2e2e2e] mb-6">Featured Hotels</h2>
            <div className="bg-[#57b3ca] h-1.5 w-36 mx-auto rounded"></div>
            </div>
            
                     <div className="grid grid-cols-3 gap-8">
             {(() => {
               console.log('🎨 Rendering featured hotels section:');
               console.log('   - loadingFeatured:', loadingFeatured);
               console.log('   - featuredHotels.length:', featuredHotels.length);
               console.log('   - featuredHotels:', featuredHotels);
               return null;
             })()}
             {loadingFeatured ? (
               // Loading state
               Array.from({ length: 3 }).map((_, index) => (
                 <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg animate-pulse">
                   <div className="h-[340px] bg-gray-200 relative"></div>
                   <div className="p-6">
                     <div className="h-6 bg-gray-200 rounded mb-2"></div>
                     <div className="h-4 bg-gray-200 rounded mb-4"></div>
                     <div className="flex items-center gap-8">
                       {Array.from({ length: 4 }).map((_, i) => (
                         <div key={i} className="h-4 bg-gray-200 rounded w-8"></div>
                       ))}
                     </div>
                   </div>
                    </div>
               ))
             ) : featuredHotels.length > 0 ? (
                             // Real data
              featuredHotels.slice(0, 3).map((hotel) => (
                <div 
                  key={hotel.id} 
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => router.push(`/hotel/${hotel.id}?currency=USD&start_date=2025-08-14&end_date=2025-08-22&adults=2&children_ages=&rooms=1`)}
                >
                   <div className="h-[340px] bg-gray-200 relative">
                     {/* Hotel image from Fora API */}
                     {hotel.image ? (
                       <img 
                         src={`https://media.fora.travel/foratravelportal/image/upload/c_thumb,w_3840,h_1668,g_center/f_auto/q_auto/v1/${hotel.image}`}
                         alt={hotel.name}
                         className="w-full h-full object-cover"
                         onError={(e) => {
                           // Fallback to gradient if image fails to load
                           const target = e.target as HTMLImageElement;
                           target.style.display = 'none';
                           target.nextElementSibling?.classList.remove('hidden');
                         }}
                       />
                     ) : null}
                     {/* Fallback gradient background */}
                     <div className={`absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center ${hotel.image ? 'hidden' : ''}`}>
                       <div className="text-white text-4xl font-bold text-center">
                         {hotel.name.split(' ').slice(0, 2).map((word: string) => word[0]).join('')}
                    </div>
                  </div>
                     <div className="absolute top-3 right-3 w-6 h-6 opacity-30">
                       <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                       </svg>
                     </div>
                     <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                       <div className="flex justify-between items-center">
                         <span className="text-white text-lg font-semibold">{hotel.commission_range}</span>
                      <div className="flex gap-1">
                           {hotel.labels.slice(0, 4).map((label: any, index: number) => (
                             <div key={index} className="w-2 h-2 bg-white rounded-full"></div>
                        ))}
                      </div>
                    </div>
                     </div>
                   </div>
                   <div className="p-6">
                     <h3 className="text-lg font-bold text-[#484848] mb-2 line-clamp-2">{hotel.name}</h3>
                     <p className="text-sm text-[#9a9a9a] mb-4">
                       {hotel.physical_city && hotel.physical_country 
                         ? `${hotel.physical_city}, ${hotel.physical_country}`
                         : hotel.physical_country || 'Location not specified'
                       }
                     </p>
                     <div className="flex items-center gap-4 text-sm text-[#484848]">
                       <div className="flex items-center gap-2">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                         </svg>
                         <span>{hotel.labels.length}</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                         </svg>
                         <span>1</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                         </svg>
                         <span>{hotel.commission_range}</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                         </svg>
                         <span>0</span>
                       </div>
                     </div>
                   </div>
                 </div>
               ))
             ) : (
               // Fallback when no data
               <div className="col-span-3 text-center py-12">
                 <p className="text-gray-500 text-lg">No featured hotels available at the moment.</p>
               </div>
             )}
           </div>
                    </div>
      </section>
                    
                    {/* Browse More Hotels Section */}
       <section className="py-24 px-4">
         <div className="max-w-[1269px] mx-auto">
          <div className="bg-gray-200 rounded-xl p-16 relative overflow-hidden">
            <div className="relative z-10 max-w-md">
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight">Browse For More Hotels</h2>
              <p className="text-white text-lg mb-8">Explore Hotel by their categories/types...</p>
              <button 
                onClick={handleFindHotelClick}
                className="bg-[#57b3ca] text-white px-10 py-4 rounded-[30px] font-bold hover:bg-[#4a9bb0] transition-colors"
              >
                Find your Hotel
              </button>
                        </div>
                        </div>
                      </div>
      </section>

                    {/* Hotel Booking Tips Section */}
       <section className="py-24 px-4">
         <div className="max-w-[1269px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#2e2e2e] mb-6">Hotel Booking Tips</h2>
            <div className="bg-[#57b3ca] h-1.5 w-36 mx-auto rounded"></div>
          </div>
          
          <div className="grid grid-cols-3 gap-8 mb-12">
            {[
              { title: 'Choose the right Hotel !', category: 'Travel Basics' },
              { title: 'Book Hotels Smart', category: 'Smart Savings' },
              { title: 'Essential Hotel Amenities', category: 'Guest Experience' }
            ].map((tip, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="h-[340px] bg-gray-200 rounded-xl mb-4"></div>
                <h3 className="text-lg font-bold text-[#484848] mb-2">{tip.title}</h3>
                <p className="text-sm text-[#9a9a9a]">{tip.category}</p>
                          </div>
                        ))}
                    </div>
                    
          <div className="text-center">
            <button 
              onClick={handleViewAllBlogsClick}
              className="bg-[#57b3ca] text-white px-10 py-4 rounded-[30px] font-bold hover:bg-[#4a9bb0] transition-colors"
            >
              View All Blogs
            </button>
                    </div>
                  </div>
      </section>

                    {/* Why Book With Us Section */}
       <section className="py-24 px-4">
         <div className="max-w-[1269px] mx-auto">
          <div className="grid grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-[#2e2e2e] mb-6">Why Book With Us</h2>
              <div className="bg-[#57b3ca] h-1.5 w-36 mb-8"></div>
              <p className="text-xl text-[#121212] mb-8 leading-relaxed">
                At vero eos et accusamus et iusto odio dignissimos ducimus qui
                blanditiis praesentium voluptatum deleniti atque corrupti quos
                dolores et quas molestias excepturi sint occaecati cupiditate non
                provident, similique sunt in culpa qui officia deserunt mollitia
                animi, id est laborum et dolorum fuga.
              </p>
              <div className="flex gap-6 mb-8">
                <a href="#" className="text-xl font-bold text-[#484848] hover:text-[#57b3ca] transition-colors">Ask A Question</a>
                <a href="#" className="text-xl font-bold text-[#484848] hover:text-[#57b3ca] transition-colors">Find A Property</a>
                </div>
              <button 
                onClick={handleDiscoverMoreClick}
                className="bg-[#57b3ca] text-white px-10 py-4 rounded-[30px] font-bold hover:bg-[#4a9bb0] transition-colors"
              >
                Discover More
              </button>
            </div>
            <div className="h-[439px] bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </section>

                    {/* Newsletter Section */}
       <section className="py-24 px-4">
         <div className="max-w-[1269px] mx-auto">
          <div className="bg-[#57b3ca] rounded-[50px] p-8 mb-16">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white text-lg font-bold mb-2">NEWSLETTER</h3>
                <p className="text-white text-sm">Stay Upto Date</p>
              </div>
              <div className="flex-1 mx-8">
                <input 
                  type="email" 
                  placeholder="Your Email..." 
                  className="w-full px-6 py-4 rounded-[26px] border-2 border-white/20 bg-white text-gray-700 focus:outline-none focus:border-white"
                />
              </div>
              <button className="bg-white rounded-full w-[52px] h-[52px] flex items-center justify-center hover:bg-gray-100 transition-colors">
                <svg className="w-6 h-6 text-[#57b3ca]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

             {/* Footer */}
       <footer className="bg-[#57b3ca] text-white py-16">
         <div className="max-w-[1269px] mx-auto px-4">
          <div className="grid grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-5xl font-extrabold mb-6">LOGO</h3>
              <p className="text-sm mb-8 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <div className="flex gap-4">
                <button className="bg-gray-200 text-gray-700 px-4 py-3 rounded-md flex items-center gap-2 hover:bg-gray-300 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  PlayStore
                </button>
                <button className="bg-gray-200 text-gray-700 px-4 py-3 rounded-md flex items-center gap-2 hover:bg-gray-300 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"/>
                  </svg>
                  AppleStore
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-6">COMPANY</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-gray-200 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">Blogs</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-6">HELP CENTER</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-gray-200 transition-colors">Booking Guide</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">Payment Methods</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">Why Us?</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-gray-200 transition-colors">Cancellation Policy</a></li>
              </ul>
          </div>
            
            <div>
              <h4 className="text-lg font-bold mb-6">CONTACT INFO</h4>
              <ul className="space-y-4 text-sm">
                <li>Phone: 1234567890</li>
                <li>Email: company@email.com</li>
                <li>Location: 100 Smart Street, LA, USA</li>
              </ul>
              <div className="flex gap-4 mt-6">
                <a href="#" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/20 pt-8">
            <div className="flex justify-between items-center text-sm">
              <p>© 2022 thecreation.design | All rights reserved</p>
              <p>Created with love by <span className="font-bold">thecreation.design</span></p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 