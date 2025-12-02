import { test, expect } from '@playwright/test';

test.describe('Provider Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        // Mock the profile API call
        await page.route('**/api/users/profile', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    id: 'provider-123',
                    email: 'provider@example.com',
                    role: 'PROVIDER',
                    profile: { name: 'Test Provider' }
                })
            });
        });

        // Mock appointments API
        await page.route('**/api/appointments', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        _id: 'apt-1',
                        startTime: new Date().toISOString(), // Today
                        endTime: new Date(Date.now() + 3600000).toISOString(),
                        status: 'CONFIRMED',
                        client: {
                            profile: { name: 'Test Client' },
                            email: 'client@example.com'
                        },
                        service: {
                            name: 'Test Service',
                            duration: 60
                        }
                    }
                ])
            });
        });

        // Mock clients API
        await page.route('**/api/users/clients', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        _id: 'client-1',
                        name: 'Test Client',
                        email: 'client@example.com',
                        phone: '123-456-7890',
                        totalVisits: 5,
                        totalRevenue: 500,
                        lastVisit: new Date().toISOString(),
                        bookings: [
                            { _id: 'b1', service: 'Test Service', date: new Date().toISOString(), status: 'CONFIRMED', price: 100 }
                        ]
                    }
                ])
            });
        });

        // Set the token cookie
        await page.context().addCookies([{
            name: 'token',
            value: 'fake-jwt-token',
            domain: 'localhost',
            path: '/'
        }]);
    });

    test('should load the dashboard and display key sections', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page).toHaveTitle(/ETO/);
        await expect(page.getByRole('heading', { name: /Welcome/ })).toBeVisible();
    });

    test('should navigate to Calendar and display appointments', async ({ page }) => {
        await page.goto('/dashboard/calendar');
        await expect(page).toHaveURL(/\/dashboard\/calendar/);
        await expect(page.getByRole('button', { name: 'Today' })).toBeVisible();

        // Verify mock appointment is visible
        await expect(page.getByText(/Test Client/)).toBeVisible();
    });

    test('should navigate to Clients, search, and view details', async ({ page }) => {
        // Setup wait for response before navigation
        const clientsResponsePromise = page.waitForResponse('**/api/users/clients');

        await page.goto('/dashboard/clients');
        await expect(page.getByRole('heading', { name: 'Clients Directory' })).toBeVisible();

        // Wait for the API call to complete
        await clientsResponsePromise;

        const searchInput = page.getByPlaceholder('Search clients...');
        await expect(searchInput).toBeVisible();
        await searchInput.fill('Test');

        // Verify client card is visible before clicking
        await expect(page.getByText('Test Client')).toBeVisible();
        await page.getByText('Test Client').click();

        // Check for modal content
        await expect(page.getByRole('heading', { name: 'Test Client' })).toBeVisible();
        await expect(page.getByText('Total Revenue')).toBeVisible();
        await expect(page.getByText('$500')).toBeVisible();

        // Check for Coming Soon badges
        import { test, expect } from '@playwright/test';

        test.describe('Provider Dashboard', () => {
            test.beforeEach(async ({ page }) => {
                // Mock the profile API call
                await page.route('**/api/users/profile', async route => {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            id: 'provider-123',
                            email: 'provider@example.com',
                            role: 'PROVIDER',
                            profile: { name: 'Test Provider' }
                        })
                    });
                });

                // Mock appointments API
                await page.route('**/api/appointments', async route => {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify([
                            {
                                _id: 'apt-1',
                                startTime: new Date().toISOString(), // Today
                                endTime: new Date(Date.now() + 3600000).toISOString(),
                                status: 'CONFIRMED',
                                client: {
                                    profile: { name: 'Test Client' },
                                    email: 'client@example.com'
                                },
                                service: {
                                    name: 'Test Service',
                                    duration: 60
                                }
                            }
                        ])
                    });
                });

                // Mock clients API
                await page.route('**/api/users/clients', async route => {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify([
                            {
                                _id: 'client-1',
                                name: 'Test Client',
                                email: 'client@example.com',
                                phone: '123-456-7890',
                                totalVisits: 5,
                                totalRevenue: 500,
                                lastVisit: new Date().toISOString(),
                                bookings: [
                                    { _id: 'b1', service: 'Test Service', date: new Date().toISOString(), status: 'CONFIRMED', price: 100 }
                                ]
                            }
                        ])
                    });
                });

                // Set the token cookie
                await page.context().addCookies([{
                    name: 'token',
                    value: 'fake-jwt-token',
                    domain: 'localhost',
                    path: '/'
                }]);
            });

            test('should load the dashboard and display key sections', async ({ page }) => {
                await page.goto('/dashboard');
                await expect(page).toHaveTitle(/ETO/);
                await expect(page.getByRole('heading', { name: /Welcome/ })).toBeVisible();
            });

            test('should navigate to Calendar and display appointments', async ({ page }) => {
                await page.goto('/dashboard/calendar');
                await expect(page).toHaveURL(/\/dashboard\/calendar/);
                await expect(page.getByRole('button', { name: 'Today' })).toBeVisible();

                // Verify mock appointment is visible
                await expect(page.getByText(/Test Client/)).toBeVisible();
            });

            test('should navigate to Clients, search, and view details', async ({ page }) => {
                // Setup wait for response before navigation
                const clientsResponsePromise = page.waitForResponse('**/api/users/clients');

                await page.goto('/dashboard/clients');
                await expect(page.getByRole('heading', { name: 'Clients Directory' })).toBeVisible();

                // Wait for the API call to complete
                await clientsResponsePromise;

                const searchInput = page.getByPlaceholder('Search clients...');
                await expect(searchInput).toBeVisible();
                await searchInput.fill('Test');

                // Verify client card is visible before clicking
                await expect(page.getByText('Test Client')).toBeVisible();
                await page.getByText('Test Client').click();

                // Check for modal content
                await expect(page.getByRole('heading', { name: 'Test Client' })).toBeVisible();
                await expect(page.getByText('Total Revenue')).toBeVisible();
                await expect(page.getByText('$500')).toBeVisible();

                // Check for Coming Soon badges
                await expect(page.getByText('Loyalty Points')).toBeVisible();
            });

            test('should navigate to Analytics and display charts', async ({ page }) => {
                await page.goto('/dashboard/analytics');
                await expect(page.getByRole('heading', { name: 'Analytics', exact: true })).toBeVisible();

                // Check for KPI cards
                await expect(page.getByText('Total Revenue')).toBeVisible();
                await expect(page.getByText('$12,450')).toBeVisible();

                // Check for Charts
                await expect(page.getByText('Revenue Trend')).toBeVisible();
                await expect(page.getByText('Weekly Status')).toBeVisible();
                await expect(page.getByText('Top Services')).toBeVisible();

                // Check for Time Range Selector
                await expect(page.getByRole('button', { name: '1W' })).toBeVisible();
                await expect(page.getByRole('button', { name: 'ALL' })).toBeVisible();
            });
        });
    });
