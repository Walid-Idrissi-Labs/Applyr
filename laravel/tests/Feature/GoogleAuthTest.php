<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Tests\TestCase;

class GoogleAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('app.frontend_url', 'http://localhost:5173');
    }

    public function test_a_verified_google_identity_creates_an_applyr_user_and_can_be_exchanged_once(): void
    {
        Socialite::fake('google', $this->googleUser());

        $callback = $this->get('/auth/google/callback');
        $code = $this->codeFromRedirect($callback->headers->get('Location'));

        $this->assertDatabaseHas('users', [
            'email' => 'person@example.com',
        ]);
        $this->assertNotNull(User::query()->where('email', 'person@example.com')->value('email_verified_at'));
        $this->assertDatabaseHas('oauth_identities', [
            'provider' => 'google',
            'provider_user_id' => 'google-user-123',
        ]);

        $exchange = $this->postJson('/api/auth/google/exchange', ['code' => $code])
            ->assertOk()
            ->assertJsonPath('user.email', 'person@example.com')
            ->assertJsonPath('user.has_password', false)
            ->assertJsonStructure(['user', 'token']);

        $this->postJson('/api/auth/google/exchange', ['code' => $code])
            ->assertUnprocessable();

        $this->withToken($exchange->json('token'))->putJson('/api/password', [
            'password' => 'new-secure-password',
            'password_confirmation' => 'new-secure-password',
        ])->assertOk()->assertJsonPath('user.has_password', true);

        $this->postJson('/api/login', [
            'email' => 'person@example.com',
            'password' => 'new-secure-password',
        ])->assertOk();
    }

    public function test_google_links_to_an_existing_account_with_the_same_verified_email(): void
    {
        $existingUser = User::factory()->create(['email' => 'person@example.com']);
        Socialite::fake('google', $this->googleUser());

        $callback = $this->get('/auth/google/callback');
        $code = $this->codeFromRedirect($callback->headers->get('Location'));

        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseHas('oauth_identities', [
            'user_id' => $existingUser->id,
            'provider' => 'google',
            'provider_user_id' => 'google-user-123',
        ]);

        $this->postJson('/api/auth/google/exchange', ['code' => $code])
            ->assertOk()
            ->assertJsonPath('user.id', $existingUser->id)
            ->assertJsonPath('user.has_password', true);
    }

    public function test_unverified_google_emails_are_not_allowed_to_create_or_link_accounts(): void
    {
        Socialite::fake('google', $this->googleUser(['email_verified' => false]));

        $this->get('/auth/google/callback')
            ->assertRedirect('http://localhost:5173/oauth/callback?error=identity_unavailable');

        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('oauth_identities', 0);
    }

    private function googleUser(array $overrides = []): SocialiteUser
    {
        return SocialiteUser::fake(array_merge([
            'id' => 'google-user-123',
            'name' => 'Google Person',
            'email' => 'person@example.com',
            'email_verified' => true,
        ], $overrides));
    }

    private function codeFromRedirect(?string $location): string
    {
        $this->assertNotNull($location);

        parse_str((string) parse_url($location, PHP_URL_QUERY), $query);

        $this->assertArrayHasKey('code', $query);

        return $query['code'];
    }
}
