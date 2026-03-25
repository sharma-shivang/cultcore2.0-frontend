'use client';

import React from 'react';
import { Award, BookOpen, Diamond, ShieldCheck, TrendingUp } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-cta selection:text-white">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-7xl font-display font-extrabold mb-6 tracking-tight animate-fade-in">
                        Elevating <span className="text-cta">Vision.</span><br />
                        Empowering <span className="text-cta">Growth.</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-secondary-text leading-relaxed animate-slide-up">
                        At <span className="font-bold text-primary italic underline decoration-cta/30">ElevateXG</span>, we bridge the gap between academic excellence and modern entrepreneurial innovation.
                    </p>
                </div>
                {/* Subtle background decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cta rounded-full blur-3xl"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
                </div>
            </section>

            {/* The Journey Section */}
            <section className="py-16 bg-surface/50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-cta mb-4">
                                Our Origin Story
                            </h2>
                            <h3 className="text-3xl md:text-4xl font-display font-bold mb-6 text-primary">
                                From Shaping Minds to <br />Elevating Lifestyles
                            </h3>
                            <div className="space-y-4 text-secondary-text leading-relaxed">
                                <p>
                                    The story of <span className="font-semibold text-foreground">ElevateXG</span> begins in the halls of prestige and the corridors of intellectual leadership. Our founder embarked on a dedicated path as a Professor, fueled by a passion for mentorship and the pursuit of excellence.
                                </p>
                                <p>
                                    This commitment to excellence led to the prestigious role of <span className="font-semibold text-foreground text-cta-hover">Director at Dr. K.N. Modi University</span>. Over years of institutional leadership, the founder didn't just manage; they mentored, built strategies, and fostered growth at the highest levels of academia.
                                </p>
                                <p>
                                    Today, <span className="font-semibold text-cta">ElevateXG</span> is the natural evolution of that journey—a transition from shaping minds in the classroom to elevating lifestyles and businesses in the global marketplace. We bring the rigor of academia to the creativity of entrepreneurship.
                                </p>
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            <div className="aspect-square bg-white dark:bg-surface rounded-[3rem] shadow-2xl p-2 rotate-3 hover:rotate-0 transition-transform duration-500 border border-primary/5">
                                <div className="w-full h-full rounded-[2.5rem] bg-gradient-to-br from-primary/5 to-cta/5 flex items-center justify-center p-8 text-secondary-text text-center italic">
                                    "Leadership is not a title; it is a journey of service and the elevation of those around you."
                                </div>
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-cta text-white p-6 rounded-2xl shadow-xl animate-bounce-subtle">
                                <Award className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20">
                <div className="container mx-auto px-4 text-center max-w-3xl">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cta/10 text-cta mb-8">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <h2 className="text-4xl font-display font-bold mb-8 text-primary">Our Mission</h2>
                    <p className="text-2xl font-medium leading-relaxed text-secondary-text italic line-clamp-4">
                        "To empower individuals and organizations through a curation of intellectual growth, elegance, and visionary leadership consulting, fostering a legacy of excellence in every facet of life."
                    </p>
                </div>
            </section>

            {/* Core Offerings Section */}
            <section className="py-20 bg-primary/5">
                <div className="container mx-auto px-4">
                    <h2 className="text-center text-4xl font-display font-bold mb-16 text-primary">What We Offer</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Gems & Jewelry */}
                        <div className="bg-white dark:bg-surface p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-primary/5 group">
                            <div className="w-14 h-14 bg-cta/10 text-cta rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Diamond className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-foreground">Gems & Jewelry</h3>
                            <p className="text-secondary-text leading-relaxed">
                                A curated selection of high-quality artificial jewelry and precious gems, representing elegance and uncompromised quality for the modern lifestyle.
                            </p>
                        </div>

                        {/* E-Books */}
                        <div className="bg-white dark:bg-surface p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-primary/5 group">
                            <div className="w-14 h-14 bg-cta/10 text-cta rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-foreground">E-Books</h3>
                            <p className="text-secondary-text leading-relaxed">
                                Sharing established and cutting-edge knowledge through digital literature, designed to foster intellectual growth and personal empowerment.
                            </p>
                        </div>

                        {/* Consultancy */}
                        <div className="bg-white dark:bg-surface p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-primary/5 group">
                            <div className="w-14 h-14 bg-cta/10 text-cta rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-foreground">Consultancy</h3>
                            <p className="text-secondary-text leading-relaxed">
                                Leveraging decades of high-level institutional leadership to provide strategic consultancy services that help individuals and businesses thrive.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Compliance Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto bg-surface border border-primary/10 rounded-3xl p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <ShieldCheck className="w-10 h-10 text-cta" />
                            <h2 className="text-3xl font-display font-bold text-primary">Trust & Transparency</h2>
                        </div>
                        <div className="space-y-6">
                            <p className="text-secondary-text leading-relaxed mb-8">
                                We operate with the same rigor and ethical standards that defined our founder's academic career. For your assurance, here are our official registration details:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-primary/10 dark:bg-white/5 rounded-2xl border border-primary/5">
                                    <span className="block text-xs font-bold uppercase tracking-wider text-secondary-text mb-1">GST Registration</span>
                                    <span className="text-lg font-mono font-bold text-foreground">09FBKPS3502R1ZU</span>
                                </div>
                                <div className="p-4 bg-primary/10 dark:bg-white/5 rounded-2xl border border-primary/5">
                                    <span className="block text-xs font-bold uppercase tracking-wider text-secondary-text mb-1">MSME Registration</span>
                                    <span className="text-lg font-mono font-bold text-foreground">UDYAM-UP-56-0154641</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Closing */}
            <section className="py-20 text-center">
                <h2 className="text-3xl font-display font-bold text-secondary-text mb-8 italic">
                    "Elevating Excellence, One Vision at a Time."
                </h2>
                <div className="w-24 h-1 bg-cta/30 mx-auto rounded-full"></div>
            </section>
        </div>
    );
};

export default AboutPage;
