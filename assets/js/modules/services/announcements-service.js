(function () {
    function getLocalAnnouncements() {
        return window.LiveStudioFutureData?.announcements || [];
    }

    function normalizeAnnouncement(announcement) {
        return {
            id: announcement.id || '',
            title: announcement.title || '',
            body: announcement.body || '',
            priority: announcement.priority || 'normal',
            published: announcement.published !== false,
            startsAt: announcement.startsAt || null,
            endsAt: announcement.endsAt || null
        };
    }

    function isAnnouncementVisible(announcement, now = new Date()) {
        if (!announcement.published) return false;

        const startsAt = announcement.startsAt ? new Date(announcement.startsAt) : null;
        const endsAt = announcement.endsAt ? new Date(announcement.endsAt) : null;

        if (startsAt && startsAt > now) return false;
        if (endsAt && endsAt < now) return false;

        return true;
    }

    window.LiveStudioAnnouncementsService = {
        async list() {
            return getLocalAnnouncements().map(normalizeAnnouncement);
        },

        async listVisible() {
            const announcements = await this.list();
            return announcements.filter((announcement) => isAnnouncementVisible(announcement));
        }
    };
})();
