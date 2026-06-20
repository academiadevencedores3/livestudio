(function () {
    function getLocalAdsData() {
        return window.LiveStudioFutureData?.ads || { slots: [], campaigns: [] };
    }

    function normalizeAdCampaign(campaign) {
        return {
            id: campaign.id || '',
            name: campaign.name || '',
            slot: campaign.slot || 'default',
            active: campaign.active !== false,
            imageUrl: campaign.imageUrl || '',
            targetUrl: campaign.targetUrl || '',
            startsAt: campaign.startsAt || null,
            endsAt: campaign.endsAt || null
        };
    }

    function isCampaignActive(campaign, now = new Date()) {
        if (!campaign.active) return false;

        const startsAt = campaign.startsAt ? new Date(campaign.startsAt) : null;
        const endsAt = campaign.endsAt ? new Date(campaign.endsAt) : null;

        if (startsAt && startsAt > now) return false;
        if (endsAt && endsAt < now) return false;

        return true;
    }

    window.LiveStudioAdsService = {
        async getSlots() {
            return [...getLocalAdsData().slots];
        },

        async getCampaigns() {
            return getLocalAdsData().campaigns.map(normalizeAdCampaign);
        },

        async getActiveCampaigns(slot = null) {
            const campaigns = await this.getCampaigns();
            return campaigns.filter((campaign) => {
                if (slot && campaign.slot !== slot) return false;
                return isCampaignActive(campaign);
            });
        }
    };
})();
