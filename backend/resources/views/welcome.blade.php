<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Welcome | Project</title>
    <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet" />
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            font-family: 'Figtree', sans-serif;
        }
        .gradient-bg {
            background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
            background-size: 300% 300%;
            animation: gradientMove 10s ease infinite;
        }
        @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .fade-in {
            animation: fadeIn 1.2s ease forwards;
            opacity: 0;
        }
        @keyframes fadeIn {
            to { opacity: 1; }
        }
    </style>
</head>
<body class="antialiased text-gray-100 gradient-bg min-h-screen flex flex-col justify-between">

{{-- Navigation --}}
@if (Route::has('login'))
    <div class="absolute top-6 right-6 z-10">
        @auth
            <a href="{{ url('/dashboard') }}"
               class="text-sm font-semibold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition">
                Dashboard
            </a>
        @else
            <a href="{{ route('login') }}"
               class="text-sm font-semibold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition">
                Log in
            </a>
            @if (Route::has('register'))
                <a href="{{ route('register') }}"
                   class="ml-2 text-sm font-semibold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition">
                    Register
                </a>
            @endif
        @endauth
    </div>
@endif

{{-- Main Content --}}
<main class="flex flex-col items-center justify-center flex-grow text-center fade-in px-6">
    <h1 class="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
        Welcome to <span class="text-white">Project</span>
    </h1>
    <p class="text-lg md:text-xl text-white/80 mb-8 max-w-xl mx-auto">
        The elegant framework for web enthusiasts — powerful, simple, and delightful.
    </p>

    <div class="flex justify-center space-x-4">
        <a href="https://google.com"
           class="bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl hover:bg-gray-200 transition">
            Google
        </a>
        <a href="https://www.wildberries.ru/"
           class="border border-white text-white font-semibold px-6 py-3 rounded-xl hover:bg-white hover:text-gray-900 transition">
            Wildberries
        </a>
    </div>
</main>

{{-- Footer --}}
<footer class="text-center text-sm text-white/70 mb-4">
    © {{ date('Y') }} Amsoft — Crafted with ❤️ by <a href="https://gexayr.github.io" class="underline hover:text-white">Gexayr</a>
</footer>

</body>
</html>
