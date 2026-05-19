import FeaturedProducts from "@/components/home/FeaturedProducts";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Zap, ShieldCheck, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center py-20 md:py-0 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            // src="https://images.unsplash.com/photo-1635491108115-f843a860cebb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Z2VtcyUyMGFuZCUyMHN0b25lc3xlbnwwfHwwfHx8MA%3D%3D"
            // src="https://images.unsplash.com/photo-1584157234994-b1ea5fc1b444?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGdlbXMlMjBhbmQlMjBzdG9uZXN8ZW58MHx8MHx8fDA%3D"
            src="https://images.unsplash.com/photo-1678244660394-fa02a19ac24a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTJ8fGdlbXMlMjBhbmQlMjBzdG9uZXN8ZW58MHx8MHx8fDA%3D"
            alt="Background"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-[#0a0a0b]/80"></div>
        </div>

        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-cta/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-fade-in">
              <span className="flex h-2 w-2 rounded-full bg-cta animate-ping"></span>
              <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Spring Collection 2026 is Live</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight mb-8 leading-[1.1]">
              Elevate Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cta via-cta-hover to-indigo-400">
                Lifestyle
              </span>
            </h1>

            <p className="text-xl text-white/60 mb-12 max-w-2xl leading-relaxed">
              Unveil curated brilliance and timeless artistry with Cult Core. Experience rare, earth-born products tailored for the modern visionary.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <Link
                href="/products"
                className="bg-cta text-white px-10 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-cta/40 hover:shadow-cta/60 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-3 active:scale-95"
              >
                Start Exploring
                <ArrowRight className="w-6 h-6" />
              </Link>

              <Link
                href="/about"
                className="bg-white/5 text-white border border-white/10 backdrop-blur-xl px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3"
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Stats or Badges */}
        <div className="absolute bottom-6 left-0 w-full z-10 overflow-hidden hidden lg:block">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-12 text-white/40 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8" />
                <span className="font-bold text-sm uppercase tracking-widest">Secure Checkout</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8" />
                <span className="font-bold text-sm uppercase tracking-widest">Express Shipping</span>
              </div>
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-8 h-8" />
                <span className="font-bold text-sm uppercase tracking-widest">Premium Curator</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Component */}
      <FeaturedProducts />

      {/* Trust Section / Features */}
      <section className="py-24 bg-surface/50 border-y border-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Precision Craftsmanship", desc: "Every product in our collection is vetted for uncompromising quality and detail.", icon: ShieldCheck },
              { title: "All India Reach", desc: "Fast, reliable shipping all over the over country with real-time tracking.", icon: Globe },
              { title: "24/7 Concierge", desc: "Our expert support team is always available to assist with your journey.", icon: Zap },
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-surface border border-primary/5 hover:border-cta/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-cta mb-6 group-hover:scale-110 group-hover:bg-cta/10 transition-transform">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">{feature.title}</h3>
                <p className="text-secondary-text leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / CTA */}
      {/* <section className="py-24 container mx-auto px-4">
        <div className="bg-cta rounded-[3rem] p-12 md:p-24 relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-8 relative z-10">
            Join the <br className="md:hidden" /> Cult Core Circle
          </h2>
          <p className="text-white/80 text-lg md:text-xl mb-12 max-w-xl relative z-10">
            Be the first to experience our latest drops, exclusive events, and premium rewards.
          </p>

          <div className="flex flex-col sm:flex-row w-full max-w-md gap-4 relative z-10">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all font-medium"
            />
            <button className="bg-white text-cta px-8 py-4 rounded-2xl font-black hover:bg-white/90 transition-all active:scale-95 shadow-xl">
              Subscribe
            </button>
          </div>
        </div>
      </section> */}
    </div>
  );
}
