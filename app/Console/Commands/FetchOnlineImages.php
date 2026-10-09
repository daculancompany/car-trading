<?php

namespace App\Console\Commands;

use App\Models\Customer;
use App\Models\Vehicle;
use App\Models\VehicleImage;
use App\Models\VehiclePart;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class FetchOnlineImages extends Command
{
    protected $signature = 'images:fetch
        {--only=* : vehicles, parts, customers}
        {--force : Replace images that are already set}
        {--id=* : Only these record ids}
        {--per-vehicle=3 : Photos to download per vehicle}';

    protected $description = 'Download free online images (Wikimedia Commons, DiceBear) for vehicles, parts and customers';

    private const USER_AGENT = 'CDOCarTrading/1.0 (capstone project; local seeding)';

    private const PART_FILES = [
        'Air Filter' => 'File:Air filter for Toyota 1KR-FE.jpg',
        'Alternator' => 'File:Alternator.jpg',
        'ATF Fluid (1L)' => 'File:Automatic transmission fluid - ATF - Automatikgetriebeöl IMG 6732.jpg',
        'Battery' => 'File:Photo-CarBattery.jpg',
        'Brake Disc' => 'File:Disk brake dsc03682.jpg',
        'Brake Fluid DOT 3' => 'File:Delco hydrolic brake fluid, Super 11.JPG',
        'Brake Pads' => 'File:Brake pad.jpg',
        'Coolant (1 gal)' => 'File:Engine coolant.jpg',
        'Engine Oil' => 'File:Motor oil bottles variousbrands.jpg',
        'Fuel Filter' => 'File:Fuel filter.jpg',
        'Oil Filter' => 'File:Kfz-oelfilter-muenze.jpg',
        'Radiator' => 'File:Automobile radiator.jpg',
        'Spark Plug' => 'File:Bujía Bosch Yttrium Super Plus.JPG',
        'Tire' => 'File:Large tyre.jpg',
        'Wiper Blade' => 'File:Heckscheibenwischer kl.jpg',
    ];

    private const REJECT_WORDS = [
        'interior', 'engine', 'logo', 'badge', 'emblem', 'dashboard', 'rally', 'dakar', 'racing', 'race', 'police', 'polis',
        'taxi', 'ambulance', 'wheel', 'tyre', 'tire', 'seat', 'trunk', 'boot', 'crash', 'wreck', 'accident', 'concept', 'toy car', 'diecast',
        'model kit', 'diagram', 'patent', 'map', 'gazoo', 'livery',
    ];

    private array $searchCache = [];

    private array $usedUrls = [];

    public function handle(): int
    {
        $only = collect($this->option('only'))->flatMap(fn ($value) => explode(',', $value))->filter()->values();
        $wants = fn (string $key) => $only->isEmpty() || $only->contains($key);

        if ($wants('vehicles')) {
            $this->fetchVehicles();
        }

        if ($wants('parts')) {
            $this->fetchParts();
        }

        if ($wants('customers')) {
            $this->fetchCustomers();
        }

        $this->info('Done.');

        return self::SUCCESS;
    }

    private function fetchVehicles(): void
    {
        $this->line('<comment>Vehicles</comment>');
        $count = max(1, (int) $this->option('per-vehicle'));

        foreach ($this->scoped(Vehicle::with(['brand', 'model', 'images']))->get() as $vehicle) {
            $label = trim("{$vehicle->brand?->brand} {$vehicle->model?->model}");
            $placeholder = $vehicle->images->every(fn ($image) => preg_match('#^vehicles/\d+/photo-\d+\.jpg$#', $image->image_path));

            if (!$this->option('force') && $vehicle->images->isNotEmpty() && !$placeholder) {
                $this->line("  skip #{$vehicle->id} {$label} (has photos)");
                continue;
            }

            $urls = $this->vehicleSet($vehicle, $count);

            if (empty($urls)) {
                $this->warn("  none found for #{$vehicle->id} {$label}");
                continue;
            }

            $saved = [];
            foreach ($urls as $index => $url) {
                $path = $this->download($url, "vehicles/{$vehicle->id}/online-" . ($index + 1) . '-' . Str::random(6) . '.jpg');
                if ($path) {
                    $saved[] = $path;
                }
            }

            if (empty($saved)) {
                $this->warn("  download failed for #{$vehicle->id} {$label}");
                continue;
            }

            foreach ($vehicle->images as $image) {
                Storage::disk('public')->delete($image->image_path);
                $image->delete();
            }

            foreach ($saved as $path) {
                VehicleImage::create(['vehicle_id' => $vehicle->id, 'image_path' => $path]);
            }

            $this->info("  #{$vehicle->id} {$label}: " . count($saved) . ' photo(s)');
        }
    }

    private function fetchParts(): void
    {
        $this->line('<comment>Vehicle parts</comment>');

        foreach ($this->scoped(VehiclePart::query())->get() as $part) {
            if (!$this->option('force') && $part->image_path) {
                $this->line("  skip {$part->part_name} (has image)");
                continue;
            }

            $file = self::PART_FILES[$part->part_name] ?? (Str::startsWith($part->part_name, 'Tire') ? self::PART_FILES['Tire'] : null);
            $urls = $file ? array_filter([$this->commonsFileUrl($file)]) : [];

            if (empty($urls)) {
                $urls = $this->pickUrls(array_column($this->searchCommons('intitle:"' . trim(preg_replace('/\(.*?\)/', '', $part->part_name)) . '"'), 'url'), 1);
            }

            $path = $urls ? $this->download($urls[0], "vehicle-parts/online-{$part->id}-" . Str::random(6) . '.jpg') : null;

            if (!$path) {
                $this->warn("  none found for {$part->part_name}");
                continue;
            }

            if ($part->image_path) {
                Storage::disk('public')->delete($part->image_path);
            }

            $part->update(['image_path' => $path]);
            $this->info("  {$part->part_name}");
        }
    }

    private function fetchCustomers(): void
    {
        $this->line('<comment>Customers</comment>');

        foreach ($this->scoped(Customer::query())->get() as $customer) {
            if (!$this->option('force') && $customer->image_path) {
                $this->line("  skip #{$customer->id} (has photo)");
                continue;
            }

            $seed = urlencode(trim("{$customer->first_name} {$customer->last_name}") ?: "customer-{$customer->id}");
            $path = $this->download(
                "https://api.dicebear.com/9.x/personas/png?size=400&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&seed={$seed}",
                "customers/avatar-{$customer->id}-" . Str::random(6) . '.png',
            );

            if (!$path) {
                $this->warn("  failed for #{$customer->id}");
                continue;
            }

            if ($customer->image_path) {
                Storage::disk('public')->delete($customer->image_path);
            }

            $customer->update(['image_path' => $path]);
            $this->info("  #{$customer->id} {$customer->first_name} {$customer->last_name}");
        }
    }

    private function scoped($query)
    {
        $ids = collect($this->option('id'))->flatMap(fn ($value) => explode(',', $value))->filter()->map(fn ($id) => (int) $id);

        return $ids->isEmpty() ? $query : $query->whereKey($ids->all());
    }

    private function commonsFileUrl(string $title): ?string
    {
        $response = $this->request('https://commons.wikimedia.org/w/api.php', [
            'action' => 'query',
            'format' => 'json',
            'titles' => $title,
            'prop' => 'imageinfo',
            'iiprop' => 'url',
            'iiurlwidth' => 900,
        ]);

        $info = collect($response?->json('query.pages', []))->first()['imageinfo'][0] ?? null;

        return $info['thumburl'] ?? $info['url'] ?? null;
    }

    private function request(string $url, array $query = [])
    {
        for ($attempt = 1; $attempt <= 5; $attempt++) {
            try {
                $response = Http::withHeaders(['User-Agent' => self::USER_AGENT])->timeout(30)->get($url, $query);

                if ($response->status() !== 429 && $response->status() < 500) {
                    usleep(1200000);

                    return $response;
                }
            } catch (Throwable) {
            }

            sleep($attempt * 12);
        }

        return null;
    }

    private function searchCommons(string $query): array
    {
        if (isset($this->searchCache[$query])) {
            return $this->searchCache[$query];
        }

        try {
            $response = $this->request('https://commons.wikimedia.org/w/api.php', [
                    'action' => 'query',
                    'format' => 'json',
                    'generator' => 'search',
                    'gsrsearch' => "{$query} filetype:bitmap",
                    'gsrnamespace' => 6,
                    'gsrlimit' => 50,
                    'prop' => 'imageinfo',
                    'iiprop' => 'url|mime',
                    'iiurlwidth' => 1200,
                ]);

            $pages = collect($response?->json('query.pages', []))
                ->sortBy('index')
                ->filter(fn ($page) => in_array($page['imageinfo'][0]['mime'] ?? '', ['image/jpeg', 'image/png'], true))
                ->reject(fn ($page) => Str::contains(Str::lower($page['title'] ?? ''), self::REJECT_WORDS))
                ->map(fn ($page) => [
                    'title' => $page['title'],
                    'url' => $page['imageinfo'][0]['thumburl'] ?? $page['imageinfo'][0]['url'] ?? null,
                ])
                ->filter(fn ($item) => $item['url'])
                ->values()
                ->all();
        } catch (Throwable $e) {
            $this->warn("  search failed: {$e->getMessage()}");
            $pages = [];
        }

        return $this->searchCache[$query] = $pages;
    }

    private function vehicleSet(Vehicle $vehicle, int $count): array
    {
        $base = "intitle:\"{$vehicle->model?->model}\" intitle:\"{$vehicle->brand?->brand}\"";
        $shots = [];

        foreach (['front', 'rear', 'side'] as $angle) {
            foreach ($this->searchCommons("{$base} intitle:{$angle}") as $item) {
                if (isset($this->usedUrls[$item['url']]) || !Str::contains(Str::lower($item['title']), $angle)) {
                    continue;
                }
                $shots[$this->setKey($item['title'])][$angle] ??= $item['url'];
            }
        }

        $pairs = array_filter($shots, fn ($set) => isset($set['front'], $set['rear']));

        if (empty($pairs)) {
            return $this->pickSet($this->searchCommons($base), 1, $vehicle->color);
        }

        $colorWords = $this->colorWords($vehicle->color);
        $year = (int) $vehicle->year_model;

        uksort($pairs, function ($a, $b) use ($pairs, $colorWords, $year) {
            $score = function ($key) use ($pairs, $colorWords, $year) {
                $points = count($pairs[$key]) * 2;
                $points += $colorWords->filter(fn ($word) => Str::contains($key, $word))->count() * 20;
                if (preg_match('/\b(19|20)\d{2}\b/', $key, $match)) {
                    $gap = abs((int) $match[0] - $year);
                    $points += $gap === 0 ? 10 : ($gap <= 3 ? 5 : 0);
                }

                return $points;
            };

            return $score($b) <=> $score($a);
        });

        $set = array_slice(array_values(reset($pairs)), 0, $count);
        $this->pickUrls($set, $count);

        return $set;
    }

    private function colorWords(?string $color)
    {
        return collect(preg_split('/\s+/', Str::lower((string) $color)))
            ->reject(fn ($word) => in_array($word, ['metallic', 'pearl', 'mica', 'super', ''], true));
    }

    private function pickSet(array $results, int $count, ?string $color): array
    {
        $groups = [];
        foreach ($results as $item) {
            if (isset($this->usedUrls[$item['url']])) {
                continue;
            }
            $groups[$this->setKey($item['title'])][$item['url']] = $item['title'];
        }

        if (empty($groups)) {
            return [];
        }

        $colorWords = $this->colorWords($color);

        uksort($groups, function ($a, $b) use ($groups, $colorWords) {
            $score = fn ($key) => min(count($groups[$key]), 3) * 10
                + ($colorWords->contains(fn ($word) => Str::contains($key, $word)) ? 5 : 0);

            return $score($b) <=> $score($a);
        });

        $set = array_slice(array_keys(reset($groups)), 0, $count);
        $this->pickUrls($set, $count);

        return $set;
    }

    private function setKey(string $title): string
    {
        $key = Str::lower(preg_replace('/^file:/i', '', pathinfo($title, PATHINFO_FILENAME)));
        $key = preg_replace('/\b(img|dsc|dscf|dscn|p|pxl|imag)[ _-]?\d+/', 'img', $key);
        $key = preg_replace('/\(\d{1,3}\)|\b(front|rear|back|side|view|left|right|three-quarter|3\/4|profile|quarter|fl|fr|rl|rr|f|r)\b/', ' ', $key);
        $key = preg_replace('/\s\d{1,3}$/', ' ', trim($key));
        $key = preg_replace('/[^a-z0-9]+/', ' ', $key);

        return trim(preg_replace('/\s+/', ' ', $key));
    }

    private function pickUrls(array $urls, int $count): array
    {
        $fresh = array_values(array_filter($urls, fn ($url) => !isset($this->usedUrls[$url])));
        $picked = array_slice($fresh ?: $urls, 0, $count);

        foreach ($picked as $url) {
            $this->usedUrls[$url] = true;
        }

        return $picked;
    }

    private function download(string $url, string $path): ?string
    {
        try {
            $response = $this->request($url);

            if (!$response || !$response->successful() || !Str::startsWith($response->header('Content-Type'), 'image/')) {
                return null;
            }

            $extension = match (Str::before($response->header('Content-Type'), ';')) {
                'image/png' => 'png',
                'image/webp' => 'webp',
                default => 'jpg',
            };
            $path = preg_replace('/\.\w+$/', ".{$extension}", $path);

            Storage::disk('public')->put($path, $response->body());

            return $path;
        } catch (Throwable) {
            return null;
        }
    }
}
