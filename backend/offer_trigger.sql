-- Trigger Function
CREATE OR REPLACE FUNCTION handle_offer_acceptance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the Ad status to 'sold'
    UPDATE Listing
    SET status = 'sold', sold_at = NOW()
    WHERE listing_id = (SELECT ad_id FROM Offers WHERE offer_id = NEW.offer_id);

    -- Reject all other offers on the same ad
    UPDATE Offers
    SET status = 'rejected'
    WHERE ad_id = (SELECT ad_id FROM Offers WHERE offer_id = NEW.offer_id)
    AND offer_id != NEW.offer_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_offer_acceptance
AFTER UPDATE ON Offers
FOR EACH ROW
WHEN (NEW.status = 'accepted')
EXECUTE FUNCTION handle_offer_acceptance();
