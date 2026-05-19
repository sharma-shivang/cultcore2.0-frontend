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
                        At <span className="font-bold text-primary italic underline decoration-cta/30">Cult Core</span>, We <span className="font-bold text-primary italic underline decoration-cta/30">Pooja Singh</span> and <span className="font-bold text-primary italic underline decoration-cta/30">Ipshita Singh</span> bring together timeless elegance, and modern entrepreneurial innovation to create a brand built on passion, purpose, and vision.
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
                                    <span className="font-semibold text-foreground">Cult Core</span> is a story shaped by two generations of ambition, vision, and determination. It begins with <span className="font-semibold text-foreground">Pooja Singh</span>, a qualified <span className="font-semibold text-foreground">CMA</span> whose professional journey was built in the corporate world through dedication, strategic thinking, and a strong commitment to excellence. Years of experience in finance and corporate leadership helped shape a mindset driven by discipline, growth, and purposeful decision-making.
                                </p>
                                <p>
                                    Alongside this journey was <span className="font-semibold text-foreground">Ipshita Singh</span>, a college <span className="font-semibold text-foreground">student</span> with a fresh perspective and a passion for modern ideas, creativity, and entrepreneurship. Growing up around values of hard work and perseverance, she developed a contemporary outlook and a desire to create something meaningful for a new generation.
                                </p>
                                <p>
                                    Today, <span className="font-semibold text-foreground">Cult Core</span> stands as the evolution of this mother-daughter partnership transforming shared values into a brand that blends experience with innovation, structure with creativity, and timeless vision with modern ambition.
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
                        "To inspire and empower individuals through innovation, creativity, and purposeful growth, building a brand that blends experience with fresh perspectives while creating meaningful impact and a culture of excellence."
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
                                A curated selection of high quality artificial jewelry and precious gems, representing elegance and uncompromised quality for the modern lifestyle.
                            </p>
                        </div>

                        {/* E-Books */}
                        <div className="bg-white dark:bg-surface p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-primary/5 group">
                            <div className="w-14 h-14 bg-cta/10 text-cta rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-foreground">Product Scoop</h3>
                            <p className="text-secondary-text leading-relaxed">
                                Curating thoughtfully selected products and emerging trends, designed to enhance lifestyles, inspire individuality, and deliver meaningful value.
                            </p>
                        </div>

                        {/* Consultancy */}
                        <div className="bg-white dark:bg-surface p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-primary/5 group">
                            <div className="w-14 h-14 bg-cta/10 text-cta rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-foreground">Keychains</h3>
                            <p className="text-secondary-text leading-relaxed">
                                Transforming everyday accessories into small expressions of identity, with keychains designed to blend creativity, style, and personal meaning.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Compliance Section */}
            {/* <section className="py-16">
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
            </section> */}

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
